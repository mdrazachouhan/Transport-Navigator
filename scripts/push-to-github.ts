import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) throw new Error('X_REPLIT_TOKEN not found');

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    { headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken } }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;
  if (!connectionSettings || !accessToken) throw new Error('GitHub not connected');
  return accessToken;
}

async function getGitHubClient() {
  return new Octokit({ auth: await getAccessToken() });
}

const IGNORE_PATTERNS = [
  'node_modules', '.expo', 'dist', 'web-build', '.git', '.cache',
  '.replit', 'replit.nix', '.config', '.local', 'generated-icon.png',
  'scripts', '.upm', 'replit.md', 'expo-env.d.ts',
];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => {
    const parts = filePath.split('/');
    return parts.some(part => part === pattern) || filePath === pattern;
  });
}

function getAllFiles(dirPath: string, basePath: string = ''): { path: string; fullPath: string }[] {
  const files: { path: string; fullPath: string }[] = [];
  const entries = fs.readdirSync(dirPath);
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const relativePath = basePath ? `${basePath}/${entry}` : entry;
    if (shouldIgnore(relativePath)) continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, relativePath));
    } else if (stat.isFile()) {
      files.push({ path: relativePath, fullPath });
    }
  }
  return files;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function pushToGitHub() {
  console.log('Connecting to GitHub...');
  const octokit = await getGitHubClient();

  const { data: ghUser } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${ghUser.login}`);

  const repoName = 'TransportGo';
  let needsInit = false;

  try {
    const { data: repo } = await octokit.repos.get({ owner: ghUser.login, repo: repoName });
    console.log(`Repository "${repoName}" already exists.`);
    try {
      await octokit.repos.getContent({ owner: ghUser.login, repo: repoName, path: 'README.md' });
    } catch {
      needsInit = true;
    }
  } catch (e: any) {
    if (e.status === 404) {
      console.log(`Creating repository "${repoName}"...`);
      await octokit.repos.createForAuthenticatedUser({
        name: repoName,
        description: 'TransportGo - Transport & Logistics Mobile App for Indore, India. Built with Expo + React Native + Express.',
        private: false,
        auto_init: true,
      });
      console.log('Repository created with initial commit!');
      await delay(3000);
    } else {
      throw e;
    }
  }

  if (needsInit) {
    console.log('Initializing repository with README...');
    await octokit.repos.createOrUpdateFileContents({
      owner: ghUser.login,
      repo: repoName,
      path: 'README.md',
      message: 'Initial commit',
      content: Buffer.from('# TransportGo\nTransport & Logistics Mobile App').toString('base64'),
    });
    await delay(2000);
  }

  const projectDir = '/home/runner/workspace';
  const files = getAllFiles(projectDir);
  console.log(`Found ${files.length} files to push.`);

  console.log('Creating blobs...');
  const blobs: { path: string; sha: string; mode: string; type: string }[] = [];
  let uploaded = 0;

  for (const file of files) {
    let retries = 3;
    while (retries > 0) {
      try {
        const content = fs.readFileSync(file.fullPath);
        const base64Content = content.toString('base64');

        const { data: blob } = await octokit.git.createBlob({
          owner: ghUser.login,
          repo: repoName,
          content: base64Content,
          encoding: 'base64',
        });

        blobs.push({ path: file.path, sha: blob.sha, mode: '100644', type: 'blob' });
        uploaded++;
        process.stdout.write(`\r  Uploaded ${uploaded}/${files.length} files`);
        break;
      } catch (err: any) {
        retries--;
        if (retries === 0) {
          console.log(`\n  Failed: ${file.path}: ${err.message}`);
        } else {
          await delay(1000);
        }
      }
    }
  }
  console.log('');

  if (blobs.length === 0) {
    console.error('No files uploaded!');
    process.exit(1);
  }

  console.log('Creating file tree...');
  const { data: ref } = await octokit.git.getRef({
    owner: ghUser.login,
    repo: repoName,
    ref: 'heads/main',
  });
  const parentSha = ref.object.sha;

  const { data: tree } = await octokit.git.createTree({
    owner: ghUser.login,
    repo: repoName,
    base_tree: parentSha,
    tree: blobs as any,
  });

  console.log('Creating commit...');
  const { data: commit } = await octokit.git.createCommit({
    owner: ghUser.login,
    repo: repoName,
    message: 'TransportGo - Full app with maps, animations, and logistics features',
    tree: tree.sha,
    parents: [parentSha],
  });

  await octokit.git.updateRef({
    owner: ghUser.login,
    repo: repoName,
    ref: 'heads/main',
    sha: commit.sha,
    force: true,
  });

  console.log('\nDone! Your code is now on GitHub:');
  console.log(`https://github.com/${ghUser.login}/${repoName}`);
}

pushToGitHub().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

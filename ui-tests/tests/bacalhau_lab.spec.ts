import {
  expect,
  test,
  galata,
  IJupyterLabPageFixture
} from '@jupyterlab/galata';
import path from 'path';
/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

async function openInProtocol(
  page: IJupyterLabPageFixture,
  protocol: 'Bacalhau' | 'Error'
): Promise<void> {
  await page
    .getByRole('combobox', {
      name: 'DeAI Selector'
    })
    .click();
  await page
    .getByRole('combobox', { name: 'DeAI Selector' })
    .selectOption(protocol);
}
test.describe('UI Test', () => {
  test.beforeEach(async ({ page, request }) => {
    page.setViewportSize({ width: 1920, height: 1080 });
    const dir = 'examples';
    const content = galata.newContentsHelper(request);
    await content.deleteDirectory(`/${dir}`);
    await content.uploadDirectory(
      path.resolve(__dirname, '../notebooks'),
      `/${dir}`
    );
    await page.goto();
    const fileName = 'test-bhl.ipynb';
    const fullPath = `${dir}/${fileName}`;
    await page.notebook.openByPath(fullPath);
    await page.notebook.activate(fullPath);
  });

  test('should have run in button', async ({ page }) => {
    const toolbar = await page.getByRole('navigation', {
      name: 'notebook actions'
    });

    expect(await toolbar.screenshot()).toMatchSnapshot({
      name: 'run-in-toolbar.png',
      maxDiffPixelRatio: 0.01
    });
    await page
      .getByRole('combobox', {
        name: 'DeAI Selector'
      })
      .click();
    expect(await page.screenshot()).toMatchSnapshot({
      name: 'run-in-drop-down.png',
      maxDiffPixelRatio: 0.01
    });
  });
  test('should show the DeAI with bhl protocol', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');
    const deaiFile = await page
      .getByRole('region', { name: 'side panel content' })
      .getByText('test-bhl.bhl.deai');
    await expect(deaiFile).toHaveCount(1);
    await expect(await page.screenshot()).toMatchSnapshot({
      name: 'deai-bhl-interface.png',
      maxDiffPixelRatio: 0.01
    });
  });

  test('should show the available docker images in bhl protocol', async ({
    page
  }) => {
    await openInProtocol(page, 'Bacalhau');

    const dockerImages = await page.getByRole('button', {
      name: 'Select docker image'
    });
    await dockerImages.click();
    const listbox = await page.getByRole('listbox', {
      name: 'Select docker image'
    });
    await listbox.waitFor({ state: 'visible' });
    await expect(await listbox.screenshot()).toMatchSnapshot({
      name: 'deai-bhl-docker-images.png',
      maxDiffPixelRatio: 0.01
    });
    await page.getByRole('option', { name: 'python:3' }).click();
    await listbox.waitFor({ state: 'hidden', timeout: 1000 });
    await page.waitForTimeout(500);
    await expect(await page.screenshot()).toMatchSnapshot({
      name: 'deai-bhl-selected-python3.png',
      maxDiffPixelRatio: 0.01
    });
  });

  test('should show the custom docker image input', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');

    const dockerImages = await page.getByRole('button', {
      name: 'Select docker image'
    });
    await dockerImages.click();
    const listbox = await page.getByRole('listbox', {
      name: 'Select docker image'
    });
    await listbox.waitFor({ state: 'visible' });

    await page.getByRole('option', { name: 'Custom image' }).click();
    await listbox.waitFor({ state: 'hidden', timeout: 1000 });
    await page.waitForTimeout(500);
    await expect(await page.screenshot()).toMatchSnapshot({
      name: 'deai-bhl-selected-custom.png',
      maxDiffPixelRatio: 0.01
    });
    const dockerInput = await page.getByPlaceholder('Docker image name');
    dockerInput.fill('python:3.9.17-slim');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    const logEl = page.locator('div.jp-LogConsolePanel');
    await page.waitForTimeout(500);
    const firstLog = await page.getByText('Adding python:3.9.17-slim image');
    await firstLog.waitFor({ state: 'visible' });
    await expect(await logEl.screenshot()).toMatchSnapshot({
      name: 'deai-start-adding-image.png',
      maxDiffPixelRatio: 0.05
    });
    const secondLog = await page.getByText(
      'Image python:3.9.17-slim added successfully'
    );
    await secondLog.waitFor({ state: 'visible', timeout: 360000 });
    await expect(await logEl.screenshot()).toMatchSnapshot({
      name: 'deai-end-adding-image.png',
      maxDiffPixelRatio: 0.05
    });
  });
  test('should show missing docker image error', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');
    await page.waitForTimeout(500);
    const run = page.getByRole('button', { name: 'RUN' });
    await run.waitFor({ state: 'visible' });
    await run.click();
    await page.waitForTimeout(500);
    const root = await page.locator('.MuiContainer-root');
    await expect(await root.screenshot()).toMatchSnapshot({
      name: 'deai-missing-docker-image.png',
      maxDiffPixelRatio: 0.01
    });
  });
  test('should add the resource', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');
    await page.getByRole('button', { name: 'Add resource' }).click();
    const resourceInput = await page.getByLabel('Path to resource');
    await resourceInput.waitFor({ state: 'visible' });
    const root = await page.locator('.MuiContainer-root');
    await expect(await root.screenshot()).toMatchSnapshot({
      name: 'deai-add-new-resource.png',
      maxDiffPixelRatio: 0.05
    });
  });
  test('should remove the resource', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');
    await page.getByRole('button', { name: 'Add resource' }).click();
    const resourceInput = await page.getByLabel('Path to resource');
    await resourceInput.waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.waitForTimeout(500);
    const root = await page.locator('.MuiContainer-root');
    await expect(await root.screenshot()).toMatchSnapshot({
      name: 'deai-remove-old-resource.png',
      maxDiffPixelRatio: 0.05
    });
  });
  test('should check for the resource', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');

    await page.getByRole('button', { name: 'Select docker image' }).click();
    await page.getByRole('option', { name: 'python:3', exact: true }).click();

    await page.getByRole('button', { name: 'Add resource' }).click();
    const resourceInput = await page.getByLabel('Path to resource');
    await resourceInput.waitFor({ state: 'visible' });
    await page.getByLabel('Path to resource').fill('foobar');

    await page.getByRole('button', { name: 'RUN' }).click();
    await page.waitForTimeout(500);
    const root = await page.locator('.MuiContainer-root');
    await expect(await root.screenshot()).toMatchSnapshot({
      name: 'deai-resource-error.png',
      maxDiffPixelRatio: 0.05
    });
  });
  test('should valid the resource', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');

    await page.getByRole('button', { name: 'Select docker image' }).click();
    await page.getByRole('option', { name: 'python:3', exact: true }).click();
    await page.getByRole('button', { name: 'Add resource' }).click();
    const resourceInput = await page.getByLabel('Path to resource');
    await resourceInput.waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'File/Directory' }).click();
    await page.getByRole('option', { name: 'URL' }).click();
    await page.getByLabel('URL').fill('https://www.google.com/');
    await page.getByRole('button', { name: 'RUN' }).click();
    await page.waitForTimeout(500);
    const root = await page.locator('.MuiContainer-root');
    await expect(await root.screenshot()).toMatchSnapshot({
      name: 'deai-resource-valid.png',
      maxDiffPixelRatio: 0.05
    });
  });
  test('should run the job', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');

    await page.getByRole('button', { name: 'Select docker image' }).click();
    await page.getByRole('option', { name: 'python:3', exact: true }).click();

    await page.getByRole('button', { name: 'RUN' }).click();
    await page.waitForTimeout(5000);

    await expect(await page.screenshot()).toMatchSnapshot({
      name: 'deai-submit-job.png',
      maxDiffPixelRatio: 0.05
    });
  });
  test('should download the result', async ({ page }) => {
    await openInProtocol(page, 'Bacalhau');

    await page.getByRole('button', { name: 'Select docker image' }).click();
    await page.getByRole('option', { name: 'python:3', exact: true }).click();

    await page.getByRole('button', { name: 'RUN' }).click();
    await page.waitForTimeout(5000);
    await page.getByRole('button', { name: 'GET RESULT' }).click();
    await page.waitForTimeout(5000);
    await page
      .getByRole('button', { name: 'Refresh the file browser.' })
      .click();
    await page.waitForTimeout(1000);
    await expect(await page.screenshot()).toMatchSnapshot({
      name: 'deai-get-result.png',
      maxDiffPixelRatio: 0.05
    });
  });
});

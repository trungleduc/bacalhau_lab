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
  test('should show the DeAI with error protocol', async ({ page }) => {
    await openInProtocol(page, 'Error');
    const deaiFile = await page
      .getByRole('region', { name: 'side panel content' })
      .getByText('test-bhl.err.deai');
    await expect(deaiFile).toHaveCount(1);
    await expect(await page.screenshot()).toMatchSnapshot({
      name: 'deai-error-interface.png',
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
  test('should show the available docker images in error protocol', async ({
    page
  }) => {
    await openInProtocol(page, 'Error');

    const dockerImages = await page.getByRole('button', {
      name: 'Select docker image'
    });
    await dockerImages.click();
    const listbox = await page.getByRole('listbox', {
      name: 'Select docker image'
    });
    await listbox.waitFor({ state: 'visible' });
    await expect(await listbox.screenshot()).toMatchSnapshot({
      name: 'deai-error-docker-images.png',
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
});

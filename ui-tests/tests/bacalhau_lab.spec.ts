import { expect, test, galata } from '@jupyterlab/galata';
import path from 'path';
/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });
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
  test('should emit an activation console message', async ({ page }) => {
    const logs: string[] = [];

    page.on('console', message => {
      logs.push(message.text());
    });

    await page.goto();

    expect(
      logs.filter(s => s === 'JupyterLab extension bacalhau_lab is activated!')
    ).toHaveLength(1);
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
    await page
      .getByRole('combobox', {
        name: 'DeAI Selector'
      })
      .click();
    await page
      .getByRole('combobox', { name: 'DeAI Selector' })
      .selectOption('Bacalhau');
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
    await page
      .getByRole('combobox', {
        name: 'DeAI Selector'
      })
      .click();
    await await page
      .getByRole('combobox', { name: 'DeAI Selector' })
      .selectOption('Error');
    const deaiFile = await page
      .getByRole('region', { name: 'side panel content' })
      .getByText('test-bhl.err.deai');
    await expect(deaiFile).toHaveCount(1);
    await expect(await page.screenshot()).toMatchSnapshot({
      name: 'deai-error-interface.png',
      maxDiffPixelRatio: 0.01
    });
  });
});

import { HTMLSelect, ReactWidget } from '@jupyterlab/ui-components';
import * as React from 'react';
import { CommandRegistry } from '@lumino/commands';
import { IDeAIProtocol } from '../token';

const TOOLBAR_CELLTYPE_CLASS = 'jp-Notebook-toolbarCellType';

const TOOLBAR_CELLTYPE_DROPDOWN_CLASS = 'jp-Notebook-toolbarCellTypeDropdown';

export class DeAISwitcher extends ReactWidget {
  /**
   * Construct a new cell type switcher.
   */
  constructor(serverData: IDeAIProtocol, commands: CommandRegistry) {
    super();
    this._commands = commands;
    this._serverData = serverData;
    this.addClass(TOOLBAR_CELLTYPE_CLASS);
  }

  /**
   * Handle `change` events for the HTMLSelect component.
   */
  handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    const protocol = event.target.value;
    this._commands.execute('notebook:open-with-bhl', {
      protocol,
      ext: this._serverData.availableProtocol[protocol].ext
    });
    this.update();
  };

  /**
   * Handle `keydown` events for the HTMLSelect component.
   */
  handleKeyDown = (event: React.KeyboardEvent): void => {
    /** */
  };

  render(): JSX.Element {
    return (
      <HTMLSelect
        className={TOOLBAR_CELLTYPE_DROPDOWN_CLASS}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        aria-label={'DeAI Selector'}
        title={'DeAI Protocol'}
        value={'DeAI'}
      >
        <option value="DeAI">Run in...</option>
        {Object.entries(this._serverData.availableProtocol).map(
          ([key, value]) => {
            return (
              <option value={key} key={key}>
                {key}
              </option>
            );
          }
        )}
      </HTMLSelect>
    );
  }

  private _commands: CommandRegistry;
  private _serverData: IDeAIProtocol;
}

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
  constructor(allProtocols: IDeAIProtocol, commands: CommandRegistry) {
    super();
    this._commands = commands;
    this._allProtocols = allProtocols;
    this.addClass(TOOLBAR_CELLTYPE_CLASS);
  }

  /**
   * Handle `change` events for the HTMLSelect component.
   */
  handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    this._commands.execute('notebook:open-with-bhl', {
      protocol: event.target.value
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
        <option value="DeAI">DeAI Protocol</option>
        {Object.entries(this._allProtocols.availableProtocol).map(
          ([key, value]) => {
            return (
              <option value={key} key={key}>
                {key.toUpperCase()}
              </option>
            );
          }
        )}
      </HTMLSelect>
    );
  }

  private _commands: CommandRegistry;
  private _allProtocols: IDeAIProtocol;
}

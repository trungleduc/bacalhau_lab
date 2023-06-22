import { IWidgetTracker } from '@jupyterlab/apputils';
import { IDocumentWidget } from '@jupyterlab/docregistry';
import { Token } from '@lumino/coreutils';
import { Widget } from '@lumino/widgets';
import { BhlDocWidget } from './document/bhlDocWidget';

export const IBhlViewerTracker = new Token<IBhlViewerTracker>(
  'bhl:IBhlViewerTracker',
  'A widget tracker for bhl file.'
);

export type IBhlViewerTracker = IWidgetTracker<BhlDocWidget>;

export type IBhlDocWidget = IDocumentWidget<Widget>;

export interface IDict<T = any> {
  [key: string]: T;
}
export interface IDeAIProtocol {
  availableProtocol: IDict<{
    icon?: string;
    availableImages: string[];
    ext: string;
  }>;
}

export const IDeAIProtocol = new Token<IDeAIProtocol>(
  'bhl:IDeAIProtocol',
  'Available protocol data'
);

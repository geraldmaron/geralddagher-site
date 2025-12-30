/**
 * Table Utilities for Slate Editor
 * 
 * Functions for table manipulation including adding/removing rows and columns,
 * preventing nested tables, and managing table structure.
 */

import { Editor, Transforms, Element as SlateElement, Node, Path } from 'slate';
import { ReactEditor } from 'slate-react';
import { CustomElement } from '@/lib/types/editor';

/**
 * Check if the current selection is inside a table
 */
export const isInTable = (editor: Editor): boolean => {
  try {
    const { selection } = editor;
    if (!selection) return false;

    const [tableEntry] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === 'table',
      mode: 'highest',
    });

    return !!tableEntry;
  } catch (error) {
    return false;
  }
};

/**
 * Get the current table node if cursor is in a table
 */
export const getCurrentTable = (editor: Editor): [CustomElement, Path] | null => {
  try {
    const { selection } = editor;
    if (!selection) return null;

    const [tableEntry] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === 'table',
      mode: 'highest',
    });

    if (tableEntry) {
      return tableEntry as [CustomElement, Path];
    }
  } catch (_) {
    return null;
  }
  return null;
};

/**
 * Insert a new table at the cursor position
 * Prevents nesting by checking if already in a table
 */
export const insertTable = (
  editor: Editor,
  rows: number = 2,
  cols: number = 3
): boolean => {
  // Prevent table nesting
  if (isInTable(editor)) {
    return false;
  }

  try {
    const table: CustomElement = {
      type: 'table',
      children: Array.from({ length: rows }, (_, rowIndex) => ({
        type: 'table-row',
        children: Array.from({ length: cols }, (_, colIndex) => ({
          type: 'table-cell',
          children: [
            {
              text: rowIndex === 0 ? `Header ${colIndex + 1}` : '',
            },
          ],
        })),
      })),
    };

    Transforms.insertNodes(editor, table);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Add a new row to the table
 */
export const addTableRow = (editor: Editor, position: 'above' | 'below' = 'below'): boolean => {
  const tableData = getCurrentTable(editor);
  if (!tableData) return false;

  const [table, tablePath] = tableData;

  try {
    const { selection } = editor;
    if (!selection) return false;

    // Find current row
    const [rowEntry] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === 'table-row',
    });

    if (!rowEntry) return false;

    const [row, rowPath] = rowEntry as [CustomElement, Path];
    
    const numCols = row.children.length;

    const newRow: CustomElement = {
      type: 'table-row',
      children: Array.from({ length: numCols }, () => ({
        type: 'table-cell',
        children: [{ text: '' }],
      })),
    };

    // Insert at appropriate position
    const insertPath = position === 'above' ? rowPath : Path.next(rowPath);
    Transforms.insertNodes(editor, newRow, { at: insertPath });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Remove the current row from the table
 */
export const removeTableRow = (editor: Editor): boolean => {
  const tableData = getCurrentTable(editor);
  if (!tableData) return false;

  const [table] = tableData;

  try {
    // Find current row
    const [rowEntry] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === 'table-row',
    });

    if (!rowEntry) return false;

    const [, rowPath] = rowEntry;

    // Don't allow removing if it's the last row
    if (table.children.length <= 1) {
      return false;
    }

    Transforms.removeNodes(editor, { at: rowPath });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Add a new column to the table
 */
export const addTableColumn = (editor: Editor, position: 'left' | 'right' = 'right'): boolean => {
  const tableData = getCurrentTable(editor);
  if (!tableData) return false;

  const [table, tablePath] = tableData;

  try {
    const { selection } = editor;
    if (!selection) return false;

    // Find current cell
    const [cellEntry] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === 'table-cell',
    });

    if (!cellEntry) return false;

    const [, cellPath] = cellEntry;
    const cellIndex = cellPath[cellPath.length - 1];
    const insertIndex = position === 'left' ? cellIndex : cellIndex + 1;

    // Add a cell to each row at the specified index
    table.children.forEach((row, rowIndex) => {
      if ('type' in row && row.type === 'table-row') {
        const newCell: CustomElement = {
          type: 'table-cell',
          children: [{ text: '' }],
        };

        const cellInsertPath = [...tablePath, rowIndex, insertIndex];
        Transforms.insertNodes(editor, newCell, { at: cellInsertPath });
      }
    });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Remove the current column from the table
 */
export const removeTableColumn = (editor: Editor): boolean => {
  const tableData = getCurrentTable(editor);
  if (!tableData) return false;

  const [table, tablePath] = tableData;

  try {
    // Find current cell
    const [cellEntry] = Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === 'table-cell',
    });

    if (!cellEntry) return false;

    const [, cellPath] = cellEntry;
    const cellIndex = cellPath[cellPath.length - 1];

    const firstRow = table.children[0];
    if (firstRow && 'type' in firstRow && firstRow.type === 'table-row' && firstRow.children.length <= 1) {
      return false;
    }

    // Remove cell from each row at the specified index
    table.children.forEach((row, rowIndex) => {
      if ('type' in row && row.type === 'table-row') {
        const cellRemovePath = [...tablePath, rowIndex, cellIndex];
        Transforms.removeNodes(editor, { at: cellRemovePath });
      }
    });

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Delete the entire table
 */
export const deleteTable = (editor: Editor): boolean => {
  const tableData = getCurrentTable(editor);
  if (!tableData) return false;

  const [, tablePath] = tableData;

  try {
    Transforms.removeNodes(editor, { at: tablePath });
    return true;
  } catch (error) {
    return false;
  }
};


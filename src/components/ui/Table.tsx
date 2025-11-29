import { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface TableProps {
  className?: string;
  children: ReactNode;
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export interface TableRowProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

/**
 * Terminal-styled table component with composable sub-components
 */
export function Table({ className, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={clsx(
          'w-full border-collapse font-mono text-sm',
          className
        )}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <th
      className={clsx(
        'border border-terminal-primary bg-terminal-dim/10 text-terminal-secondary',
        'px-3 py-2 text-left uppercase tracking-wide',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      className={clsx(
        'border border-terminal-primary/30 px-3 py-2 text-terminal-primary',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableRow({ className, children, onClick }: TableRowProps) {
  return (
    <tr
      className={clsx(
        'hover:bg-terminal-dim/5 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Export composed components as properties for easier import
Table.Header = TableHeader;
Table.Cell = TableCell;
Table.Row = TableRow;

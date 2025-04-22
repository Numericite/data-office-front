import { fr } from "@codegouvfr/react-dsfr";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type TableOptions,
} from "@tanstack/react-table";
import { Fragment } from "react";
import { tss } from "tss-react";

export interface DsfrTableProps<TData> {
  /** Row data */
  data: TData[];
  /** Column definitions created with TanStack Table helpers */
  columns: ColumnDef<TData, any>[];
  renderSubComponent: (props: { row: Row<TData> }) => React.ReactElement;
  /**
   * Extra options forwarded to `useReactTable`.
   * `data` and `columns` are automatically injected and therefore cannot be
   * overridden from here.
   */
  tableOptions?: Omit<Partial<TableOptions<TData>>, "data" | "columns">;
  /** Additional class name(s) applied to the `<table>` element */
  tableClassName?: string;
  /** Additional class name(s) applied to the wrapper `<div>` */
  wrapperClassName?: string;
}

const useStyles = tss.withName("DsfrTable").create(() => ({
  tableWrapper: {
    overflowX: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  table: {
    display: "inline-table!important",
  },
}));

export function DsfrTable<TData>({
  data,
  columns,
  tableOptions,
  tableClassName,
  wrapperClassName,
  renderSubComponent,
}: DsfrTableProps<TData>) {
  const { cx, classes } = useStyles();

  const table = useReactTable<TData>({
    data,
    columns,
    // Always include the core row model; users can override or extend through `tableOptions`.
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    ...tableOptions,
  });

  return (
    <div>
      <div
        className={cx(
          fr.cx("fr-table", "fr-table--bordered"),
          classes.tableWrapper,
          wrapperClassName
        )}
      >
        <table className={cx(classes.table, tableClassName)}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <tr>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr>
                    {/* 2nd row is a custom 1 cell row */}
                    <td colSpan={row.getVisibleCells().length}>
                      {renderSubComponent({ row })}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DsfrTable;

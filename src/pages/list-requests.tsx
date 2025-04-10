import Head from "next/head";
import { fr } from "@codegouvfr/react-dsfr";
import { tss } from "tss-react";
import { api } from "~/utils/api";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Request } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Download } from "@codegouvfr/react-dsfr/Download";
import type { AlertProps } from "@codegouvfr/react-dsfr/Alert";

type RequestForTable = Pick<Request, "id" | "status" | "yamlFile">;

const columnHelper = createColumnHelper<RequestForTable>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("yamlFile", {
    header: "Fichier YAML",
    cell: (info) => {
      const fileName = info.getValue().split("/").pop();
      return (
        <Download
          details={false}
          label={fileName}
          className={fr.cx("fr-m-0", "fr-p-0")}
          linkProps={{
            href: info.getValue(),
          }}
        />
      );
    },
  }),
  columnHelper.accessor("status", {
    header: "Statut",
    cell: (info) => {
      const status = info.getValue();
      let severity: AlertProps.Severity | undefined;
      let text = "";

      switch (status) {
        case "pending":
          severity = "info";
          text = "En attente";
          break;
        case "approved":
          severity = "success";
          text = "Approuvé";
          break;
        case "rejected":
          severity = "error";
          text = "Rejeté";
          break;
        default:
          severity = undefined;
      }

      return (
        <Badge severity={severity} noIcon>
          {text}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("id", {
    header: "Actions",
    cell: (info) => (
      <Link href={`/requests/${info.getValue()}`} target="_blank">
        Voir
      </Link>
    ),
  }),
];

const fallbackData: RequestForTable[] = [];

export default function ListRequests() {
  const { classes, cx } = useStyles();

  const { data } = api.request.getByUserId.useQuery({
    userId: "123",
  });

  const table = useReactTable({
    data: data ?? fallbackData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Head>
        <title>DCF - Accueil</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className={fr.cx("fr-mt-4w")}>
          <h1>Liste des demandes</h1>
        </div>
        <div className={cx(fr.cx("fr-table"), classes.table)}>
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
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
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

const useStyles = tss.withName(ListRequests.name).create(() => ({
  formWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: fr.spacing("3w"),
  },
  table: {},
}));

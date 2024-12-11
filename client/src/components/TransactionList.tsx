import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Transaction } from "@db/schema";

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Transacciones Recientes</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.date!).toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell className={`text-right ${
                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
              }`}>
                ${Number(transaction.amount).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

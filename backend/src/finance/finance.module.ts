import { Module, Global } from '@nestjs/common';
import { CashboxService } from './services/cashbox.service';
import { CashboxController } from './controllers/cashbox.controller';
import { CatalogService } from './services/catalog.service';
import { CatalogController } from './controllers/catalog.controller';
import { InvoicesService } from './services/invoices.service';
import { InvoicesController } from './controllers/invoices.controller';
import { ExpensesService } from './services/expenses.service';
import { ExpensesController } from './controllers/expenses.controller';
import { TransactionsService } from './services/transactions.service';
import { TransactionsController } from './controllers/transactions.controller';
import { FinanceService } from './services/finance.service';
import { FinanceController } from './controllers/finance.controller';

@Global()
@Module({
  controllers: [
    CashboxController,
    CatalogController,
    InvoicesController,
    ExpensesController,
    TransactionsController,
    FinanceController,
  ],
  providers: [
    CashboxService,
    CatalogService,
    InvoicesService,
    ExpensesService,
    TransactionsService,
    FinanceService,
  ],
  exports: [
    CashboxService,
    CatalogService,
    InvoicesService,
    ExpensesService,
    TransactionsService,
    FinanceService,
  ],
})
export class FinanceModule {}

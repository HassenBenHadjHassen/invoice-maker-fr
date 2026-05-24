// src/lib/invoiceUtils.ts

// -----------------------------
// Types
// -----------------------------

export interface InvoiceItem {
	description: string;
	quantity: number;
	unitPrice: number;
}

export interface InvoiceTotals {
	totalHT: number;
	vat: number;
	totalTTC: number;
}

// -----------------------------
// Totals Calculation
// Micro-entrepreneur → VAT = 0
// -----------------------------

export function calculateTotals(items: InvoiceItem[]): InvoiceTotals {
	const totalHT = items.reduce((acc, item) => {
		const lineTotal = item.quantity * item.unitPrice;
		return acc + lineTotal;
	}, 0);

	return {
		totalHT,
		vat: 0,
		totalTTC: totalHT,
	};
}

// -----------------------------
// Format Currency (French style)
// 1200 → 1 200,00 €
// -----------------------------

export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
	}).format(amount)
	  .replace(/\u202F/g, " ")
	  .replace(/\u00A0/g, " ");
}

// -----------------------------
// Due Date Calculation
// Default: 30 days
// -----------------------------

export function calculateDueDate(
	issueDate: string,
	delayInDays: number = 30,
): string {
	const date = new Date(issueDate);
	date.setDate(date.getDate() + delayInDays);

	return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

// -----------------------------
// Invoice Number Generation
// Format: YYYY-001
// Stored per year in localStorage
// -----------------------------

export function generateInvoiceNumber(): string {
	const year = new Date().getFullYear();
	const storageKey = `invoice-sequence-${year}`;

	const lastNumber = Number(localStorage.getItem(storageKey) || "0");
	const nextNumber = lastNumber + 1;

	localStorage.setItem(storageKey, nextNumber.toString());

	return `${year}-${String(nextNumber).padStart(3, "0")}`;
}

// -----------------------------
// Reset Sequence (Optional)
// Useful for dev/testing
// -----------------------------

export function resetInvoiceSequence(year?: number) {
	const targetYear = year || new Date().getFullYear();
	localStorage.removeItem(`invoice-sequence-${targetYear}`);
}

// -----------------------------
// Basic Item Validation
// Prevent empty lines or negative values
// -----------------------------

export function sanitizeItems(items: InvoiceItem[]): InvoiceItem[] {
	return items
		.filter((item) => item.description.trim() !== "")
		.map((item) => ({
			description: item.description.trim(),
			quantity: Math.max(0, item.quantity),
			unitPrice: Math.max(0, item.unitPrice),
		}));
}

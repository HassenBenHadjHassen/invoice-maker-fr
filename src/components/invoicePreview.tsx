import type { InvoiceItem } from "../lib/invoiceUtils";
import { formatCurrency } from "../lib/invoiceUtils";

interface InvoicePreviewProps {
	data: {
		sellerName: string;
		sellerCompany?: string;
		sellerAddress?: string;
		sellerEmail?: string;
		sellerPhone?: string;
		siret?: string;
		tvaIntra?: string;
		logoUrl?: string;
		bankName?: string;
		iban?: string;
		bic?: string;
		invoiceNumber: string;
		issueDate: string;
		dueDate: string;
		clientName: string;
		clientAddress: string;
		items: InvoiceItem[];
		totalHT: number;
		totalTTC: number;
		notes?: string;
		showUnitPrice?: boolean;
	};
}

export default function InvoicePreview({ data }: InvoicePreviewProps) {
	const hasBankDetails = data.bankName || data.iban || data.bic;
	const showUnit = data.showUnitPrice !== false;

	return (
		<>
			{/* ── Header: red FACTURE title + logo ── */}
			<div className="inv2-header">
				<div className="inv2-facture-title">FACTURE</div>

				{/* Logo: uploaded image or default CH placeholder */}
				{data.logoUrl ? (
					<img
						src={data.logoUrl}
						alt="Company logo"
						className="inv2-logo-img"
					/>
				) : (
					<div className="inv2-logo-block">
						<div className="inv2-logo-icon">
							<span className="inv2-logo-letters">CH</span>
						</div>
						<div className="inv2-logo-text">
							PLOMBERIE
							<br />
							<span>CHAUD &amp; FROID</span>
						</div>
					</div>
				)}
			</div>

			{/* ── 3-column info row ── */}
			<div className="inv2-info-row">
				<div className="inv2-info-col">
					<div className="inv2-info-label">Client :</div>
					<div className="inv2-info-value">{data.clientName || "—"}</div>
				</div>
				<div className="inv2-info-col">
					<div className="inv2-info-label">Adresse du chantier :</div>
					<div className="inv2-info-value inv2-info-muted">
						{data.clientAddress || "—"}
					</div>
				</div>
				<div className="inv2-info-col inv2-info-col--right">
					<div className="inv2-info-label">Date :</div>
					<div className="inv2-info-value">{data.issueDate}</div>
					<div className="inv2-info-label inv2-info-label--spaced">
						Facture N° {data.invoiceNumber}
					</div>
				</div>
			</div>

			{/* ── Items table ── */}
			<table className="inv2-table">
				<thead>
					<tr>
						<th className="inv2-th-desc">Description</th>
						<th>Quantité</th>
						{showUnit && <th>Prix unitaire</th>}
						{showUnit && <th>Total</th>}
					</tr>
				</thead>
				<tbody>
					{data.items.map((item: InvoiceItem, i: number) => {
						const lineTotal = item.quantity * item.unitPrice;
						return (
							<tr key={i}>
								<td>
									{item.description || (
										<span className="inv2-empty">—</span>
									)}
								</td>
								<td>{item.quantity}</td>
								{showUnit && (
									<td>
										{item.unitPrice > 0
											? formatCurrency(item.unitPrice)
											: ""}
									</td>
								)}
								{showUnit && (
									<td className="inv2-td-bold">
										{lineTotal > 0 ? formatCurrency(lineTotal) : ""}
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>

			{/* ── Total ── */}
			<div className="inv2-total-section">
				<span className="inv2-total-label">Total</span>
				<span className="inv2-total-amount">
					{formatCurrency(data.totalTTC)}
				</span>
			</div>

			{/* ── TVA note ── */}
			<div className="inv2-tva-note">
				" TVA NON APPLICABLE, ARTICLE ART.293B DU CGI "
			</div>

			{/* ── 3-column footer ── */}
			<div className="inv2-footer">
				<div className="inv2-footer-col">
					<div className="inv2-footer-title">Mon Entreprise</div>
					{data.sellerCompany && <div>{data.sellerCompany}</div>}
					{data.sellerAddress && <div>{data.sellerAddress}</div>}
					{data.siret && <div>N° Siret : {data.siret}</div>}
					{data.tvaIntra && <div>N° TVA intra : {data.tvaIntra}</div>}
				</div>
				<div className="inv2-footer-col">
					<div className="inv2-footer-title">Coordonnées</div>
					{data.sellerName && <div>{data.sellerName}</div>}
					{data.sellerPhone && <div>Téléphone : {data.sellerPhone}</div>}
					{data.sellerEmail && <div>E-mail : {data.sellerEmail}</div>}
				</div>
				<div className="inv2-footer-col">
					{hasBankDetails && (
						<>
							<div className="inv2-footer-title">Détails bancaires</div>
							{data.bankName && <div>Banque : {data.bankName}</div>}
							{data.iban && <div>IBAN : {data.iban}</div>}
							{data.bic && <div>SWIFT/BIC : {data.bic}</div>}
						</>
					)}
				</div>
			</div>

			{/* ── Notes (optional) ── */}
			{data.notes && (
				<div className="inv2-notes">
					<div className="inv2-notes-title">Notes</div>
					<div>{data.notes}</div>
				</div>
			)}
		</>
	);
}

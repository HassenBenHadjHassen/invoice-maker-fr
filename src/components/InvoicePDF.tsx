import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Image,
} from "@react-pdf/renderer";

import type { InvoiceItem } from "../lib/invoiceUtils";
import { formatCurrency } from "../lib/invoiceUtils";

interface InvoicePDFProps {
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

const BLUE = "#1a5276";
const RED = "#cc0000";
const LIGHT_GRAY = "#f8f8f8";
const BORDER_COLOR = "#e0e0e0";
const TEXT_DARK = "#222222";
const TEXT_MID = "#555555";
const TEXT_LIGHT = "#888888";

const s = StyleSheet.create({
	page: {
		padding: 44,
		fontSize: 10,
		fontFamily: "Helvetica",
		color: TEXT_DARK,
		backgroundColor: "#ffffff",
	},

	// ── Header ──────────────────────────────────────
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 20,
		paddingBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: BORDER_COLOR,
	},
	factureTitle: {
		fontSize: 30,
		fontWeight: "bold",
		color: RED,
		letterSpacing: 1,
	},
	logoImg: {
		height: 48,
		maxWidth: 140,
		objectFit: "contain",
	},
	logoBlock: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	logoIcon: {
		width: 40,
		height: 40,
		backgroundColor: RED,
		borderRadius: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	logoLetters: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "bold",
	},
	logoTextBlock: {
		flexDirection: "column",
	},
	logoName: {
		fontSize: 9,
		fontWeight: "bold",
		color: TEXT_DARK,
		letterSpacing: 0.5,
	},
	logoSub: {
		fontSize: 7.5,
		color: TEXT_LIGHT,
	},

	// ── Info row ────────────────────────────────────
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
		paddingBottom: 14,
		borderBottomWidth: 1,
		borderBottomColor: BORDER_COLOR,
	},
	infoCol: {
		flexDirection: "column",
		width: "33%",
	},
	infoColRight: {
		alignItems: "flex-end",
	},
	infoLabel: {
		fontSize: 8.5,
		fontWeight: "bold",
		color: TEXT_MID,
		marginBottom: 2,
	},
	infoValue: {
		fontSize: 10,
		color: TEXT_DARK,
		marginBottom: 1,
	},
	infoMuted: {
		color: TEXT_MID,
	},
	infoSpaced: {
		marginTop: 8,
	},

	// ── Table ────────────────────────────────────────
	tableHeader: {
		flexDirection: "row",
		backgroundColor: BLUE,
		paddingVertical: 8,
		paddingHorizontal: 10,
	},
	tableRow: {
		flexDirection: "row",
		paddingVertical: 8,
		paddingHorizontal: 10,
		borderBottomWidth: 0.5,
		borderBottomColor: "#f0f0f0",
	},
	tableRowAlt: {
		backgroundColor: LIGHT_GRAY,
	},

	// With unit price: 55 / 15 / 15 / 15
	colDesc4: { width: "55%", fontSize: 9.5 },
	colQty4: { width: "15%", textAlign: "center", fontSize: 9.5 },
	colUnit4: { width: "15%", textAlign: "center", fontSize: 9.5 },
	colTotal4: { width: "15%", textAlign: "right", fontSize: 9.5 },

	// Without unit price: 80 / 20
	colDesc2: { width: "80%", fontSize: 9.5 },
	colQty2: { width: "20%", textAlign: "center", fontSize: 9.5 },

	colHead: {
		fontWeight: "bold",
		fontSize: 8,
		color: "#ffffff",
		letterSpacing: 0.5,
	},
	colTotalBold: {
		fontWeight: "bold",
	},

	// ── Total section ────────────────────────────────
	totalSection: {
		flexDirection: "row",
		justifyContent: "flex-end",
		alignItems: "center",
		marginTop: 14,
		marginBottom: 28,
		paddingRight: 10,
		gap: 24,
	},
	totalLabel: {
		fontSize: 14,
		fontWeight: "bold",
		color: RED,
	},
	totalAmount: {
		fontSize: 14,
		fontWeight: "bold",
		color: TEXT_DARK,
	},

	// ── TVA note ────────────────────────────────────
	tvaNote: {
		textAlign: "center",
		fontSize: 9,
		fontStyle: "italic",
		color: TEXT_LIGHT,
		marginBottom: 32,
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderWidth: 0.5,
		borderColor: "#dddddd",
		borderStyle: "dashed",
		borderRadius: 4,
	},

	// ── Footer ──────────────────────────────────────
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderTopWidth: 1,
		borderTopColor: BORDER_COLOR,
		paddingTop: 14,
		marginTop: 4,
	},
	footerCol: {
		width: "32%",
		flexDirection: "column",
	},
	footerTitle: {
		fontSize: 8,
		fontWeight: "bold",
		color: TEXT_DARK,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 5,
	},
	footerRow: {
		fontSize: 8.5,
		color: TEXT_MID,
		marginBottom: 2,
	},

	// ── Notes ────────────────────────────────────────
	notesSection: {
		marginTop: 16,
		paddingTop: 12,
		borderTopWidth: 0.5,
		borderTopColor: BORDER_COLOR,
	},
	notesTitle: {
		fontSize: 7.5,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 0.8,
		color: TEXT_LIGHT,
		marginBottom: 4,
	},
	notesText: {
		fontSize: 9,
		color: TEXT_MID,
		lineHeight: 1.5,
	},
});

export default function InvoicePDF({ data }: InvoicePDFProps) {
	const hasBankDetails = data.bankName || data.iban || data.bic;
	const showUnit = data.showUnitPrice !== false;

	// Column style sets depending on showUnit
	const cDesc = showUnit ? s.colDesc4 : s.colDesc2;
	const cQty = showUnit ? s.colQty4 : s.colQty2;

	return (
		<Document>
			<Page size="A4" style={s.page}>
				{/* ── Header ── */}
				<View style={s.header}>
					<Text style={s.factureTitle}>FACTURE</Text>

					{/* Logo: uploaded image or default CH block */}
					{data.logoUrl ? (
						<Image src={data.logoUrl} style={s.logoImg} />
					) : (
						<View style={s.logoBlock}>
							<View style={s.logoIcon}>
								<Text style={s.logoLetters}>CH</Text>
							</View>
							<View style={s.logoTextBlock}>
								<Text style={s.logoName}>PLOMBERIE</Text>
								<Text style={s.logoSub}>CHAUD & FROID</Text>
							</View>
						</View>
					)}
				</View>

				{/* ── Info row ── */}
				<View style={s.infoRow}>
					<View style={s.infoCol}>
						<Text style={s.infoLabel}>Client :</Text>
						<Text style={s.infoValue}>{data.clientName || "—"}</Text>
					</View>
					<View style={s.infoCol}>
						<Text style={s.infoLabel}>Adresse du chantier :</Text>
						<Text style={[s.infoValue, s.infoMuted]}>
							{data.clientAddress || "—"}
						</Text>
					</View>
					<View style={[s.infoCol, s.infoColRight]}>
						<Text style={s.infoLabel}>Date :</Text>
						<Text style={s.infoValue}>{data.issueDate}</Text>
						<Text style={[s.infoLabel, s.infoSpaced]}>
							Facture N° {data.invoiceNumber}
						</Text>
					</View>
				</View>

				{/* ── Table header ── */}
				<View style={s.tableHeader}>
					<Text style={[cDesc, s.colHead]}>Description</Text>
					<Text style={[cQty, s.colHead]}>Quantité</Text>
					{showUnit && (
						<Text style={[s.colUnit4, s.colHead]}>Prix unitaire</Text>
					)}
					{showUnit && (
						<Text style={[s.colTotal4, s.colHead]}>Total</Text>
					)}
				</View>

				{/* ── Table rows ── */}
				{data.items.map((item: InvoiceItem, i: number) => {
					const lineTotal = item.quantity * item.unitPrice;
					return (
						<View
							key={i}
							style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
						>
							<Text style={cDesc}>{item.description || "—"}</Text>
							<Text style={cQty}>{item.quantity}</Text>
							{showUnit && (
								<Text style={s.colUnit4}>
									{item.unitPrice > 0
										? formatCurrency(item.unitPrice)
										: ""}
								</Text>
							)}
							{showUnit && (
								<Text style={[s.colTotal4, s.colTotalBold]}>
									{lineTotal > 0 ? formatCurrency(lineTotal) : ""}
								</Text>
							)}
						</View>
					);
				})}

				{/* ── Total ── */}
				<View style={s.totalSection}>
					<Text style={s.totalLabel}>Total</Text>
					<Text style={s.totalAmount}>
						{formatCurrency(data.totalTTC)}
					</Text>
				</View>

				{/* ── TVA note ── */}
				<View style={s.tvaNote}>
					<Text>" TVA NON APPLICABLE, ARTICLE ART.293B DU CGI "</Text>
				</View>

				{/* ── Footer ── */}
				<View style={s.footer}>
					<View style={s.footerCol}>
						<Text style={s.footerTitle}>Mon Entreprise</Text>
						{data.sellerCompany ? (
							<Text style={s.footerRow}>{data.sellerCompany}</Text>
						) : null}
						{data.sellerAddress ? (
							<Text style={s.footerRow}>{data.sellerAddress}</Text>
						) : null}
						{data.siret ? (
							<Text style={s.footerRow}>N° Siret : {data.siret}</Text>
						) : null}
						{data.tvaIntra ? (
							<Text style={s.footerRow}>
								N° TVA intra : {data.tvaIntra}
							</Text>
						) : null}
					</View>

					<View style={s.footerCol}>
						<Text style={s.footerTitle}>Coordonnées</Text>
						{data.sellerName ? (
							<Text style={s.footerRow}>{data.sellerName}</Text>
						) : null}
						{data.sellerPhone ? (
							<Text style={s.footerRow}>
								Téléphone : {data.sellerPhone}
							</Text>
						) : null}
						{data.sellerEmail ? (
							<Text style={s.footerRow}>E-mail : {data.sellerEmail}</Text>
						) : null}
					</View>

					<View style={s.footerCol}>
						{hasBankDetails ? (
							<>
								<Text style={s.footerTitle}>Détails bancaires</Text>
								{data.bankName ? (
									<Text style={s.footerRow}>Banque : {data.bankName}</Text>
								) : null}
								{data.iban ? (
									<Text style={s.footerRow}>IBAN : {data.iban}</Text>
								) : null}
								{data.bic ? (
									<Text style={s.footerRow}>SWIFT/BIC : {data.bic}</Text>
								) : null}
							</>
						) : null}
					</View>
				</View>

				{/* ── Notes ── */}
				{data.notes ? (
					<View style={s.notesSection}>
						<Text style={s.notesTitle}>Notes</Text>
						<Text style={s.notesText}>{data.notes}</Text>
					</View>
				) : null}
			</Page>
		</Document>
	);
}

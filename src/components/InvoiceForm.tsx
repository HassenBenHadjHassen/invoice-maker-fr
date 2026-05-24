import { useEffect, useState, useRef } from "react";
import type { InvoiceItem } from "../lib/invoiceUtils";
import {
	calculateTotals,
	generateInvoiceNumber,
	calculateDueDate,
} from "../lib/invoiceUtils";

const PROFILE_KEY = "invoice-maker-profile";

interface InvoiceFormProps {
	onGenerate: (data: any) => void;
}

export default function InvoiceForm({ onGenerate }: InvoiceFormProps) {
	// ── Seller info ──
	const [sellerName, setSellerName] = useState("Hassen Ben Hadj Hassen");
	const [sellerCompany, setSellerCompany] = useState("");
	const [sellerAddress, setSellerAddress] = useState("");
	const [sellerEmail, setSellerEmail] = useState("");
	const [sellerPhone, setSellerPhone] = useState("");
	const [siret, setSiret] = useState("");
	const [tvaIntra, setTvaIntra] = useState("");

	// ── Logo ──
	const [logoUrl, setLogoUrl] = useState<string>("");
	const logoInputRef = useRef<HTMLInputElement>(null);

	// ── Bank details ──
	const [bankName, setBankName] = useState("");
	const [iban, setIban] = useState("");
	const [bic, setBic] = useState("");

	// ── Invoice metadata ──
	const [invoiceNumber, setInvoiceNumber] = useState("");
	const [issueDate, setIssueDate] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [paymentDelay, setPaymentDelay] = useState(30);
	const [notes, setNotes] = useState("");

	// ── Client ──
	const [clientName, setClientName] = useState("");
	const [clientAddress, setClientAddress] = useState("");

	// ── Line items ──
	const [items, setItems] = useState<InvoiceItem[]>([
		{ description: "", quantity: 1, unitPrice: 0 },
	]);

	// ── Options ──
	const [showUnitPrice, setShowUnitPrice] = useState(true);
	const [invoiceTotal, setInvoiceTotal] = useState(0);

	// ── Profile save indicator ──
	const [profileSaved, setProfileSaved] = useState(false);

	// Load saved profile on mount
	useEffect(() => {
		try {
			const saved = localStorage.getItem(PROFILE_KEY);
			if (saved) {
				const p = JSON.parse(saved);
				if (p.sellerName) setSellerName(p.sellerName);
				if (p.sellerCompany) setSellerCompany(p.sellerCompany);
				if (p.sellerAddress) setSellerAddress(p.sellerAddress);
				if (p.sellerEmail) setSellerEmail(p.sellerEmail);
				if (p.sellerPhone) setSellerPhone(p.sellerPhone);
				if (p.siret) setSiret(p.siret);
				if (p.tvaIntra) setTvaIntra(p.tvaIntra);
				if (p.bankName) setBankName(p.bankName);
				if (p.iban) setIban(p.iban);
				if (p.bic) setBic(p.bic);
				if (p.logoUrl) setLogoUrl(p.logoUrl);
			}
		} catch {}

		const today = new Date().toISOString().split("T")[0];
		setIssueDate(today);
		setDueDate(calculateDueDate(today, 30));
		setInvoiceNumber(generateInvoiceNumber());
	}, []);

	useEffect(() => {
		if (issueDate) setDueDate(calculateDueDate(issueDate, paymentDelay));
	}, [paymentDelay, issueDate]);

	// Save profile to localStorage
	const saveProfile = () => {
		const profile = {
			sellerName,
			sellerCompany,
			sellerAddress,
			sellerEmail,
			sellerPhone,
			siret,
			tvaIntra,
			bankName,
			iban,
			bic,
			logoUrl,
		};
		localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
		setProfileSaved(true);
		setTimeout(() => setProfileSaved(false), 2500);
	};

	// Logo file → base64 (converted to PNG for react-pdf compatibility)
	const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(img, 0, 0);
					try {
						const pngDataUrl = canvas.toDataURL("image/png");
						setLogoUrl(pngDataUrl);
					} catch (err) {
						// Fallback if canvas conversion fails (e.g. security/tainting though local upload shouldn't)
						setLogoUrl(event.target?.result as string);
					}
				} else {
					setLogoUrl(event.target?.result as string);
				}
			};
			img.onerror = () => {
				setLogoUrl(event.target?.result as string);
			};
			img.src = event.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const updateItem = (
		index: number,
		field: keyof InvoiceItem,
		value: string,
	) => {
		const updated = [...items];
		updated[index] = {
			...updated[index],
			[field]: field === "description" ? value : Number(value),
		};
		setItems(updated);
	};

	// When unit price is hidden, user enters the line total.
	// We store: unitPrice = lineTotal / max(1, quantity)
	const updateItemLineTotal = (index: number, lineTotal: number) => {
		const updated = [...items];
		const qty = Math.max(1, updated[index].quantity);
		updated[index] = { ...updated[index], unitPrice: lineTotal / qty };
		setItems(updated);
	};

	const addItem = () =>
		setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);

	const removeItem = (index: number) =>
		setItems(items.filter((_, i) => i !== index));

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const totals = showUnitPrice
			? calculateTotals(items)
			: { totalHT: invoiceTotal, vat: 0, totalTTC: invoiceTotal };
		onGenerate({
			sellerName,
			sellerCompany,
			sellerAddress,
			sellerEmail,
			sellerPhone,
			siret,
			tvaIntra,
			bankName,
			iban,
			bic,
			logoUrl,
			invoiceNumber,
			issueDate,
			dueDate,
			clientName,
			clientAddress,
			items,
			totalHT: totals.totalHT,
			totalTTC: totals.totalTTC,
			notes,
			showUnitPrice,
		});
	};

	return (
		<form onSubmit={handleSubmit}>
			{/* ── Your Info ── */}
			<div className="form-section">
				<div className="form-section-title">Your Information</div>

				{/* Logo upload */}
				<div className="form-group">
					<label>Company logo</label>
					<div
						className="logo-upload-area"
						onClick={() => logoInputRef.current?.click()}
						role="button"
						tabIndex={0}
						onKeyDown={(e) =>
							e.key === "Enter" && logoInputRef.current?.click()
						}
					>
						{logoUrl ? (
							<img src={logoUrl} alt="Logo" className="logo-preview" />
						) : (
							<div className="logo-upload-placeholder">
								<span className="logo-upload-icon">🖼️</span>
								<span>Click to upload logo</span>
								<span className="logo-upload-hint">PNG, JPG, SVG</span>
							</div>
						)}
					</div>
					<input
						ref={logoInputRef}
						type="file"
						accept="image/*"
						style={{ display: "none" }}
						onChange={handleLogoUpload}
					/>
					{logoUrl && (
						<button
							type="button"
							className="btn-remove-logo"
							onClick={() => {
								setLogoUrl("");
								if (logoInputRef.current) logoInputRef.current.value = "";
							}}
						>
							✕ Remove logo
						</button>
					)}
				</div>

				<div className="form-group">
					<label>Full name</label>
					<input
						placeholder="Hassen Ben Hadj Hassen"
						value={sellerName}
						onChange={(e) => setSellerName(e.target.value)}
						required
					/>
				</div>

				<div className="form-group">
					<label>
						Company name{" "}
						<span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
							(optional)
						</span>
					</label>
					<input
						placeholder="Acme Freelance Studio"
						value={sellerCompany}
						onChange={(e) => setSellerCompany(e.target.value)}
					/>
				</div>

				<div className="form-group">
					<label>Address</label>
					<input
						placeholder="12 rue de la Paix, 75001 Paris"
						value={sellerAddress}
						onChange={(e) => setSellerAddress(e.target.value)}
					/>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							placeholder="you@example.com"
							value={sellerEmail}
							onChange={(e) => setSellerEmail(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label>Phone</label>
						<input
							type="tel"
							placeholder="+33 6 00 00 00 00"
							value={sellerPhone}
							onChange={(e) => setSellerPhone(e.target.value)}
						/>
					</div>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label>SIRET</label>
						<input
							placeholder="123 456 789 00012"
							value={siret}
							onChange={(e) => setSiret(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label>N° TVA intra</label>
						<input
							placeholder="FR76 410 917 301"
							value={tvaIntra}
							onChange={(e) => setTvaIntra(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* ── Bank Details ── */}
			<div className="form-section">
				<div className="form-section-title">Bank Details</div>

				<div className="form-group">
					<label>Bank name</label>
					<input
						placeholder="Crédit Agricole"
						value={bankName}
						onChange={(e) => setBankName(e.target.value)}
					/>
				</div>

				<div className="form-group">
					<label>IBAN</label>
					<input
						placeholder="FR76 1234 5678 9012 3456 7890 123"
						value={iban}
						onChange={(e) => setIban(e.target.value)}
					/>
				</div>

				<div className="form-group">
					<label>BIC / SWIFT</label>
					<input
						placeholder="AGRIFRPPXXX"
						value={bic}
						onChange={(e) => setBic(e.target.value)}
					/>
				</div>

				{/* ── Save Profile Button ── */}
				<button
					type="button"
					id="save-profile-btn"
					className={`btn btn-save-profile ${profileSaved ? "saved" : ""}`}
					onClick={saveProfile}
				>
					{profileSaved ? (
						<>✓ Profile saved!</>
					) : (
						<>💾 Save profile &amp; bank details</>
					)}
				</button>
			</div>

			{/* ── Client ── */}
			<div className="form-section">
				<div className="form-section-title">Client</div>

				<div className="form-group">
					<label>Client name</label>
					<input
						placeholder="Home Prestige Rénovation"
						value={clientName}
						onChange={(e) => setClientName(e.target.value)}
						required
					/>
				</div>

				<div className="form-group">
					<label>Site / Client address</label>
					<input
						placeholder="32 rue de la pochette, 06000 NICE"
						value={clientAddress}
						onChange={(e) => setClientAddress(e.target.value)}
						required
					/>
				</div>
			</div>

			{/* ── Invoice Details ── */}
			<div className="form-section">
				<div className="form-section-title">Invoice Details</div>

				<div className="form-row">
					<div className="form-group">
						<label>Invoice N°</label>
						<input
							value={invoiceNumber}
							onChange={(e) => setInvoiceNumber(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label>Payment delay (days)</label>
						<input
							type="number"
							value={paymentDelay}
							min={0}
							onChange={(e) => setPaymentDelay(Number(e.target.value))}
						/>
					</div>
				</div>

				<div className="form-row">
					<div className="form-group">
						<label>Issue date</label>
						<input
							type="date"
							value={issueDate}
							onChange={(e) => setIssueDate(e.target.value)}
						/>
					</div>
					<div className="form-group">
						<label>Due date</label>
						<input
							type="date"
							value={dueDate}
							onChange={(e) => setDueDate(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* ── Services ── */}
			<div className="form-section">
				<div className="form-section-title">Services</div>

				{/* Unit price toggle */}
				<div className="toggle-row">
					<span className="toggle-row-label">Show unit price column</span>
					<button
						type="button"
						id="unit-price-toggle"
						role="switch"
						aria-checked={showUnitPrice}
						className={`toggle-switch ${showUnitPrice ? "toggle-switch--on" : ""}`}
						onClick={() => setShowUnitPrice((v) => !v)}
					>
						<span className="toggle-knob" />
					</button>
				</div>

				<div className="line-items">
					{items.map((item, index) => {
						const lineTotal = item.quantity * item.unitPrice;
						return (
							<div key={index} className="line-item-card">
								{/* Top row: number badge + description */}
								<div className="line-item-top">
									<span className="line-item-num">#{index + 1}</span>
									<input
										className="line-item-desc"
										placeholder="Service or product description…"
										value={item.description}
										onChange={(e) =>
											updateItem(index, "description", e.target.value)
										}
										required
									/>
									{items.length > 1 && (
										<button
											type="button"
											className="btn-remove"
											onClick={() => removeItem(index)}
											title="Remove line"
										>
											🗑
										</button>
									)}
								</div>

								{/* Bottom row: quantity only when unit price hidden, full row when shown */}
								<div
									className={`line-item-bottom ${!showUnitPrice ? "line-item-bottom--1col" : ""}`}
								>
									<div className="line-item-field">
										<label>Quantity</label>
										<input
											type="number"
											min="0"
											placeholder="1"
											value={item.quantity}
											onChange={(e) =>
												updateItem(index, "quantity", e.target.value)
											}
											required
										/>
									</div>

									{showUnitPrice && (
										<div className="line-item-field">
											<label>Unit price (€)</label>
											<input
												type="number"
												min="0"
												step="0.01"
												placeholder="0.00"
												value={item.unitPrice}
												onChange={(e) =>
													updateItem(index, "unitPrice", e.target.value)
												}
												required
											/>
										</div>
									)}

									{showUnitPrice && (
										<div className="line-item-field">
											<label>Line total</label>
											<div className="line-item-total-box">
												{lineTotal.toLocaleString("fr-FR", {
													minimumFractionDigits: 2,
												})}{" "}
												€
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>

				<div className="line-items-footer">
					<button
						type="button"
						className="btn btn-ghost btn-add-line"
						onClick={addItem}
					>
						+ Add line
					</button>
				</div>

				{/* Single invoice total — only shown when unit price is hidden */}
				{!showUnitPrice && (
					<div className="invoice-total-input">
						<label className="invoice-total-label">Montant total de la facture (€)</label>
						<input
							id="invoice-total-field"
							type="number"
							min="0"
							step="0.01"
							placeholder="0.00"
							value={invoiceTotal || ""}
							onChange={(e) => setInvoiceTotal(Number(e.target.value))}
							required
						/>
					</div>
				)}
			</div>

			{/* ── Notes ── */}
			<div className="form-section">
				<div className="form-section-title">
					Notes{" "}
					<span
						style={{
							color: "var(--text-muted)",
							fontWeight: 400,
							textTransform: "none",
							letterSpacing: 0,
						}}
					>
						(optional)
					</span>
				</div>
				<div className="form-group">
					<textarea
						rows={3}
						placeholder="Additional payment instructions, thank-you note, etc."
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						style={{ resize: "vertical" }}
					/>
				</div>
			</div>

			{/* ── Submit ── */}
			<button type="submit" className="btn btn-primary">
				✦ Generate Invoice
			</button>
		</form>
	);
}

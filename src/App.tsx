import { useState, useRef, useCallback } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoiceForm from "./components/InvoiceForm";
import InvoicePDF from "./components/InvoicePDF";
import InvoicePreview from "./components/invoicePreview";
import "./App.css";

const MIN_WIDTH = 280;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 420;

export default function App() {
	const [invoiceData, setInvoiceData] = useState<any>(null);
	const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
	const isDragging = useRef(false);

	const onMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		isDragging.current = true;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";

		const onMouseMove = (e: MouseEvent) => {
			if (!isDragging.current) return;
			const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
			setPanelWidth(newWidth);
		};

		const onMouseUp = () => {
			isDragging.current = false;
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
			window.removeEventListener("mousemove", onMouseMove);
			window.removeEventListener("mouseup", onMouseUp);
		};

		window.addEventListener("mousemove", onMouseMove);
		window.addEventListener("mouseup", onMouseUp);
	}, []);

	return (
		<div className="app-shell">
			{/* ── Top bar ── */}
			<header className="app-topbar">
				<div className="app-topbar-logo">🧾</div>
				<div>
					<h1>InvoiceMaker</h1>
					<div className="app-topbar-sub">
						Professional invoicing for freelancers
					</div>
				</div>
			</header>

			{/* ── Two-panel body ── */}
			<main className="app-body">
				{/* LEFT — Form */}
				<aside className="form-panel" style={{ width: panelWidth }}>
					<div className="form-panel-content">
						<InvoiceForm onGenerate={setInvoiceData} />

						{invoiceData && (
							<PDFDownloadLink
								key={JSON.stringify(invoiceData)}
								document={<InvoicePDF data={invoiceData} />}
								fileName={`facture-${invoiceData.invoiceNumber}.pdf`}
								className="btn-download"
							>
								{({ loading }) =>
									loading ? "⏳ Generating PDF…" : "⬇ Download PDF"
								}
							</PDFDownloadLink>
						)}
					</div>

					{/* Drag handle on right edge */}
					<div className="resize-handle" onMouseDown={onMouseDown}>
						<div className="resize-handle-bar" />
					</div>
				</aside>

				{/* RIGHT — Live preview */}
				<section className="preview-panel">
					<div className="preview-label">Live Preview</div>

					{invoiceData ? (
						<div className="preview-paper">
							<InvoicePreview data={invoiceData} />
						</div>
					) : (
						<div className="preview-empty">
							<div className="preview-empty-icon">📄</div>
							<h3>No invoice yet</h3>
							<p>
								Fill in the form and click "Generate Invoice" to see a preview
								here.
							</p>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}

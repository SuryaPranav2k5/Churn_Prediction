"""
Generates the comprehensive ChurnMux System Architecture PDF.
"""

from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def build_pdf(filename: str = "ChurnMux_System_Architecture.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0B132B")
    accent_cyan = colors.HexColor("#00A896")
    text_dark = colors.HexColor("#1C2541")
    text_muted = colors.HexColor("#475569")
    bg_light = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#CBD5E1")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=4,
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=accent_cyan,
        spaceAfter=14,
    )

    h1_style = ParagraphStyle(
        "H1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
    )

    h2_style = ParagraphStyle(
        "H2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=accent_cyan,
        spaceBefore=8,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=text_dark,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        "Bullet",
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        "CodeBlock",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=bg_light,
        borderPadding=6,
        spaceAfter=6,
    )

    th_style = ParagraphStyle(
        "TH",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    td_style = ParagraphStyle(
        "TD",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=text_dark,
    )

    story = []

    # --- Header Banner ---
    story.append(Paragraph("ChurnMux — System Architecture Specification", title_style))
    story.append(Paragraph("Explainable Customer Churn Prediction Engine with SHAP Force-Plots & Counterfactual Lab", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_cyan, spaceBefore=0, spaceAfter=10))

    # Meta Info Table
    meta_data = [
        [
            Paragraph("<b>Problem Statement:</b> Problem 16", td_style),
            Paragraph("<b>Tech Stack:</b> LightGBM + SHAP + Flask + React", td_style),
            Paragraph("<b>Version:</b> 1.0.0 (Production)", td_style),
        ],
        [
            Paragraph("<b>Frontend:</b> Vercel (Vite SPA)", td_style),
            Paragraph("<b>Backend:</b> Render (Gunicorn WSGI)", td_style),
            Paragraph("<b>ML Validation:</b> 80/20 Stratified Holdout", td_style),
        ],
    ]
    t_meta = Table(meta_data, colWidths=[2.3 * inch, 2.8 * inch, 2.2 * inch])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg_light),
        ("BOX", (0, 0), (-1, -1), 0.5, border_color),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # --- Section 1: Executive Overview ---
    story.append(Paragraph("1. Executive Overview & Problem Statement", h1_style))
    story.append(Paragraph(
        "Traditional churn prediction algorithms operate as black-boxes: they alert businesses that an account is at risk, "
        "but fail to provide actionable causality. <b>ChurnMux</b> fulfills <b>Problem Statement 16</b> by establishing an end-to-end "
        "explainable churn intelligence platform. It unifies high-performance gradient boosted decision trees with Shapley Additive "
        "Explanations (SHAP) and a real-time counterfactual simulation engine.",
        body_style
    ))
    story.append(Paragraph("<b>Core Deliverables:</b>", body_style))
    story.append(Paragraph("• <b>Macro Explainability:</b> Portfolio-wide global feature impact ranking via mean absolute SHAP values.", bullet_style))
    story.append(Paragraph("• <b>Micro/Local Explainability:</b> Single-account SVG force-plots decomposing exact positive (churn) and negative (retention) forces.", bullet_style))
    story.append(Paragraph("• <b>Counterfactual Simulation:</b> Live 'What-If' lab allowing revenue teams to adjust parameters and witness instant risk reduction.", bullet_style))
    story.append(Paragraph("• <b>Strict Out-of-Sample Integrity:</b> Complete holdout separation ensuring zero in-sample evaluation leakage.", bullet_style))

    story.append(Spacer(1, 8))

    # --- Section 2: High-Level System Architecture ---
    story.append(Paragraph("2. System Topology & Data Flow", h1_style))
    story.append(Paragraph(
        "The system is organized into a modular three-tier architecture: the <b>ML & Explainability Core</b>, the <b>Flask REST API</b>, "
        "and the <b>React 18 Dashboard</b>.",
        body_style
    ))

    arch_rows = [
        [Paragraph("Tier / Layer", th_style), Paragraph("Technology", th_style), Paragraph("Responsibilities & Interfaces", th_style)],
        [
            Paragraph("<b>Frontend Client</b>", td_style),
            Paragraph("React 18, Vite, Custom SVG, CSS Tokens", td_style),
            Paragraph("Renders Executive KPI Bar, Account Portfolio Table, Global SHAP Bar Chart, SVG Force-Plots, and What-If Lab controls.", td_style),
        ],
        [
            Paragraph("<b>Backend API</b>", td_style),
            Paragraph("Flask 3.0, Gunicorn, CORS", td_style),
            Paragraph("Exposes RESTful endpoints (/api/accounts, /api/shap/local, /api/simulate) with sub-50ms inference latency.", td_style),
        ],
        [
            Paragraph("<b>ML & SHAP Core</b>", td_style),
            Paragraph("LightGBM 4.7, SHAP 0.51, scikit-learn", td_style),
            Paragraph("Trained on 80% train split; pre-computes TreeExplainer log-odds attributions and stores serialized artifacts.", td_style),
        ],
    ]
    t_arch = Table(arch_rows, colWidths=[1.5 * inch, 2.2 * inch, 3.6 * inch])
    t_arch.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary_color),
        ("BOX", (0, 0), (-1, -1), 0.5, border_color),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_arch)

    story.append(Spacer(1, 10))

    # --- Section 3: Machine Learning & Explainability Pipeline ---
    story.append(Paragraph("3. Machine Learning Methodology & Metrics", h1_style))
    story.append(Paragraph(
        "<b>Data Sanitization:</b> 12 columns were dropped from raw data: 3 target leakage fields (<i>Churn Reason, Churn Score, Churn Label</i>), "
        "3 zero-variance constants (<i>Count, Country, State</i>), and 6 high-cardinality/redundant geographic & ID columns (<i>CustomerID, Lat Long, City, Zip Code, Latitude, Longitude</i>). "
        "11 whitespace records in <i>Total Charges</i> were imputed with 0.0 for new subscribers.",
        body_style
    ))

    # Metrics Table
    metrics_rows = [
        [Paragraph("Evaluation Metric", th_style), Paragraph("Score", th_style), Paragraph("Methodological Significance", th_style)],
        [Paragraph("<b>Held-Out Test ROC-AUC</b>", td_style), Paragraph("<b>0.850</b>", td_style), Paragraph("Strong discrimination on unseen 20% test cohort (1,409 accounts).", td_style)],
        [Paragraph("<b>Held-Out Test PR-AUC</b>", td_style), Paragraph("<b>0.666</b>", td_style), Paragraph("Robust precision-recall area on imbalanced target (26.5% base rate).", td_style)],
        [Paragraph("<b>Test Recall (Catch Rate)</b>", td_style), Paragraph("<b>74.4%</b>", td_style), Paragraph("Successfully identifies ~3 out of every 4 departing customers.", td_style)],
        [Paragraph("<b>5-Fold CV Mean ROC-AUC</b>", td_style), Paragraph("<b>0.859 ± 0.012</b>", td_style), Paragraph("Cross-validation confirms generalization stability across folds.", td_style)],
    ]
    t_metrics = Table(metrics_rows, colWidths=[2.0 * inch, 1.3 * inch, 4.0 * inch])
    t_metrics.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary_color),
        ("BOX", (0, 0), (-1, -1), 0.5, border_color),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_metrics)

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Mathematical Foundation of SHAP Force-Plots:</b>", h2_style))
    story.append(Paragraph(
        "For an account with feature vector <i>x</i>, the model prediction <i>f(x)</i> decomposes into the expected value <i>E[f]</i> plus the sum of Shapley values: "
        "<b>f(x) = E[f] + ∑ φᵢ</b>. Positive values (φᵢ > 0) represent red forces driving churn, while negative values (φᵢ < 0) represent blue forces defending retention.",
        body_style
    ))

    story.append(PageBreak())

    # --- Section 4: Backend REST API Architecture ---
    story.append(Paragraph("4. Backend REST API Architecture & Contracts", h1_style))
    story.append(Paragraph(
        "The backend is structured around a service-oriented Flask design pattern. All model artifacts (<i>model.joblib, explainer.joblib, accounts_cache.json</i>) "
        "are loaded into memory at startup for zero-disk-latency inference.",
        body_style
    ))

    api_rows = [
        [Paragraph("Endpoint", th_style), Paragraph("Method", th_style), Paragraph("Description", th_style), Paragraph("Sample Query / Payload", th_style)],
        [Paragraph("<code>/api/health</code>", td_style), Paragraph("GET", td_style), Paragraph("Health check & model metrics.", td_style), Paragraph("None", td_style)],
        [Paragraph("<code>/api/accounts/stats</code>", td_style), Paragraph("GET", td_style), Paragraph("Macro totals (ARR at risk, Churn signal).", td_style), Paragraph("None", td_style)],
        [Paragraph("<code>/api/accounts</code>", td_style), Paragraph("GET", td_style), Paragraph("Paginated accounts with risk filters.", td_style), Paragraph("?risk_level=CRITICAL&page=1&limit=10", td_style)],
        [Paragraph("<code>/api/accounts/:id</code>", td_style), Paragraph("GET", td_style), Paragraph("Raw features for single account.", td_style), Paragraph("ACC-2222", td_style)],
        [Paragraph("<code>/api/shap/global</code>", td_style), Paragraph("GET", td_style), Paragraph("Mean absolute SHAP feature ranking.", td_style), Paragraph("None", td_style)],
        [Paragraph("<code>/api/shap/local/:id</code>", td_style), Paragraph("GET", td_style), Paragraph("Force decomposition vector for account.", td_style), Paragraph("ACC-2222", td_style)],
        [Paragraph("<code>/api/simulate</code>", td_style), Paragraph("POST", td_style), Paragraph("Counterfactual What-If simulation.", td_style), Paragraph('{"base_account_id":"ACC-2222","overrides":{"contract":"Two year"}}', td_style)],
    ]
    t_api = Table(api_rows, colWidths=[1.8 * inch, 0.7 * inch, 2.3 * inch, 2.5 * inch])
    t_api.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary_color),
        ("BOX", (0, 0), (-1, -1), 0.5, border_color),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
        ("PADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_api)

    story.append(Spacer(1, 10))

    # --- Section 5: Frontend Dashboard & Explainability UI ---
    story.append(Paragraph("5. Frontend Architecture & Component Hierarchy", h1_style))
    story.append(Paragraph(
        "Built with React 18 and Vite, the dashboard provides a high-density, mission-control user experience organized into 5 functional panels:",
        body_style
    ))

    story.append(Paragraph("• <b>Header & KPI Bar:</b> Live indicators for API status (latency in ms), Test ROC-AUC (0.850), Total Monitored Accounts (1,409), Portfolio Churn Signal (38.7%), and Critical Revenue at Risk ($50.7K MRR).", bullet_style))
    story.append(Paragraph("• <b>Panel 01 (Account Portfolio Explorer):</b> Real-time filterable grid allowing instant triage by risk level (CRITICAL ≥ 70%, ELEVATED 35-70%, LOW < 35%) with debounced search.", bullet_style))
    story.append(Paragraph("• <b>Panel 02 (Global Feature Impact):</b> Horizontal ranked bar chart illustrating macro feature importance across all accounts.", bullet_style))
    story.append(Paragraph("• <b>Panel 03 (Account Telemetry):</b> Detailed individual customer view displaying contract terms, tenure, MRR, payment method, and service subscriptions.", bullet_style))
    story.append(Paragraph("• <b>Panel 04 (SHAP Force Decomposition):</b> Custom SVG renderer showing the baseline probability anchor (26.5%), red push blocks (e.g. Month-to-month contract +0.988), and blue anchor blocks, pointing to the final predicted score.", bullet_style))
    story.append(Paragraph("• <b>Panel 05 (What-If Counterfactual Lab):</b> Interactive controls (contract dropdown, monthly fee slider, service toggles) connected to POST /api/simulate for real-time risk rebalancing.", bullet_style))

    story.append(Spacer(1, 10))

    # --- Section 6: Cloud Deployment Topology ---
    story.append(Paragraph("6. Production Cloud Deployment Topology", h1_style))

    deploy_rows = [
        [Paragraph("Deployment Layer", th_style), Paragraph("Cloud Platform", th_style), Paragraph("Configuration Details", th_style)],
        [
            Paragraph("<b>Frontend (React UI)</b>", td_style),
            Paragraph("<b>Vercel</b>", td_style),
            Paragraph("Root Directory: <code>Client</code> | Build: <code>npm run build</code> | Output: <code>dist</code> | Env: <code>VITE_API_URL</code> points to Render backend.", td_style),
        ],
        [
            Paragraph("<b>Backend + Model</b>", td_style),
            Paragraph("<b>Render</b>", td_style),
            Paragraph("Web Service | Build: <code>pip install -r requirements.txt</code> | Start: <code>gunicorn \"Server.app:create_app()\"</code> | Dynamic $PORT binding & CORS.", td_style),
        ],
    ]
    t_deploy = Table(deploy_rows, colWidths=[1.8 * inch, 1.4 * inch, 4.1 * inch])
    t_deploy.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), primary_color),
        ("BOX", (0, 0), (-1, -1), 0.5, border_color),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, border_color),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(t_deploy)

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.8, color=border_color, spaceBefore=5, spaceAfter=8))
    story.append(Paragraph("<b>ChurnMux</b> · Explainable Customer Churn Prediction Engine · Built for Hackathon Problem Statement 16", ParagraphStyle("Foot", parent=styles["Normal"], fontName="Helvetica", fontSize=8, textColor=text_muted, alignment=1)))

    doc.build(story)
    print(f"PDF successfully generated: {Path(filename).resolve()}")


if __name__ == "__main__":
    build_pdf()

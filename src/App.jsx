
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/certificates";

const navItems = [
  { label: "Home", icon: "⌂" },
  { label: "Dashboard", icon: "▦" },
  { label: "Verify Certificate", icon: "✓" },
  { label: "Records", icon: "▤" },
  { label: "Add Certificate", icon: "＋" },
];

function displayStatus(status) {
  return status === "Valid" || status === "Verified"
    ? "Verified"
    : "Pending";
}

function StatusBadge({ status }) {
  const verified = displayStatus(status) === "Verified";

  return (
    <span className={`table-status ${verified ? "verified" : "pending"}`}>
      {verified ? "Verified" : "Pending"}
    </span>
  );
}

function CertificateTable({ certificates, onDelete }) {
  if (!certificates.length) {
    return <div className="empty-state">No certificates found.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Certificate ID</th>
            <th>Student</th>
            <th>Course</th>
            <th>Issue Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {certificates.map((certificate) => (
            <tr key={certificate._id || certificate.certificateId}>
              <td>
                <strong className="certificate-id">
                  {certificate.certificateId}
                </strong>
              </td>
              <td>{certificate.studentName}</td>
              <td>{certificate.courseName}</td>
              <td>{certificate.issueDate}</td>
              <td>
                <StatusBadge status={certificate.status} />
              </td>
              <td>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => onDelete(certificate)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("Home");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [certificateId, setCertificateId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [status, setStatus] = useState("Pending");

  const [verifyId, setVerifyId] = useState("");
  const [verification, setVerification] = useState(null);
  const [search, setSearch] = useState("");

  async function loadCertificates() {
    setLoading(true);

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not load certificates.");
      }

      setCertificates(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(
        err.message ||
          "Cannot connect to the backend. Make sure server.js is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCertificates();
  }, []);

  const verifiedCount = useMemo(
    () =>
      certificates.filter(
        (certificate) => displayStatus(certificate.status) === "Verified"
      ).length,
    [certificates]
  );

  const pendingCount = certificates.length - verifiedCount;

  const filteredCertificates = certificates.filter((certificate) => {
    const query = search.toLowerCase().trim();

    return [
      certificate.certificateId,
      certificate.studentName,
      certificate.courseName,
    ].some((value) => (value || "").toLowerCase().includes(query));
  });

  function navigate(nextPage) {
    setPage(nextPage);
    setError("");
    setNotice("");
    setVerification(null);
  }

  async function addCertificate(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: certificateId.trim(),
          studentName: studentName.trim(),
          courseName: courseName.trim(),
          issueDate,
          status: status === "Verified" ? "Valid" : "Pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add certificate.");
      }

      setNotice("Certificate added successfully.");
      setCertificateId("");
      setStudentName("");
      setCourseName("");
      setIssueDate("");
      setStatus("Pending");

      await loadCertificates();
    } catch (err) {
      setError(err.message || "Could not add certificate.");
    }
  }

  async function deleteCertificate(certificate) {
    if (!certificate._id) {
      setError("This certificate has no database ID and cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete certificate ${certificate.certificateId}?`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/${certificate._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete certificate.");
      }

      setNotice("Certificate deleted successfully.");
      await loadCertificates();
    } catch (err) {
      setError(err.message || "Could not delete certificate.");
    }
  }

  async function verifyCertificate(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setVerification(null);

    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId: verifyId.trim() }),
      });

      const data = await response.json();

      setVerification({
        valid: response.ok && Boolean(data.valid),
        message: data.message || "Certificate not found.",
        certificate: data.certificate || null,
      });
    } catch {
      setError("Verification failed. Check your backend connection.");
    }
  }

  const publicPage = page === "Home" || page === "Verify Certificate";

  return (
    <div className={`app-shell ${publicPage ? "public-page" : "admin-page"}`}>
      {!publicPage && (
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-icon">☁</span> CertiCloud
          </div>

          <div className="menu-label">MAIN MENU</div>

          <nav className="side-nav">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className={`nav-item ${page === item.label ? "active" : ""}`}
                onClick={() => navigate(item.label)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {page === item.label && (
                  <span className="nav-arrow">›</span>
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-user">
              <span className="brand-icon">☁</span>
              <div>
                <strong>CertiCloud</strong>
                <div className="muted">Certificate Portal</div>
              </div>
            </div>
          </div>
        </aside>
      )}

      <div className="main-area">
        {publicPage ? (
          <header className="public-header">
            <div className="public-brand">
              <span className="brand-icon">☁</span>
              <span>CertiCloud</span>
            </div>

            <nav className="public-nav">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={`public-nav-link ${
                    page === item.label ? "active" : ""
                  }`}
                  onClick={() => navigate(item.label)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </header>
        ) : (
          <header className="topbar">
            <div>
              <h2>{page}</h2>
              <p className="muted">
                Cloud-Based Certificate Management and Verification
              </p>
            </div>

            <button
              className="button-secondary"
              type="button"
              onClick={loadCertificates}
            >
              ↻ Refresh
            </button>
          </header>
        )}

        <main className="content">
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}

          {notice && <div className="notice">{notice}</div>}

          {page === "Home" && (
            <>
              <section className="hero-section">
                <div className="hero-copy">
                  <div className="hero-badge">
                    <span className="hero-badge-dot" />
                    SECURE · SIMPLE · VERIFIABLE
                  </div>

                  <h1>Verify credentials in seconds.</h1>

                  <p className="muted">
                    Welcome to CertiCloud — a simple way to manage certificate
                    records and verify credentials using a unique certificate
                    ID.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="button-primary hero-button"
                      type="button"
                      onClick={() => navigate("Verify Certificate")}
                    >
                      Verify Certificate →
                    </button>

                    <button
                      className="button-secondary hero-button"
                      type="button"
                      onClick={() => navigate("Dashboard")}
                    >
                      Administrator Dashboard
                    </button>
                  </div>

                  <div className="hero-trust">
                    Secure records · Simple verification · Easy management
                  </div>
                </div>

                <div className="hero-visual">
                  <div className="visual-glow" />
                  <div className="certificate-art">
                    <div className="certificate-art-top">
                      <span className="certificate-art-eyebrow">
                        CERTICLOUD
                      </span>
                      <span>✦</span>
                    </div>

                    <div className="certificate-art-label">
                      CERTIFICATE
                    </div>

                    <div className="certificate-seal">✓</div>

                    <div className="certificate-art-line long" />
                    <div className="certificate-art-line" />
                    <div className="certificate-art-line short" />

                    <div className="certificate-art-signature">
                      Digitally Verified
                    </div>

                    <div className="certificate-art-stamp">✓</div>
                  </div>

                  <div className="floating-status">
                    <span className="hero-badge-dot" />
                    Verification made simple
                  </div>
                </div>
              </section>

              <section className="public-stats">
                <div>
                  <strong>{loading ? "…" : certificates.length}</strong>
                  <span>Certificates in the system</span>
                </div>
                <div>
                  <strong>{loading ? "…" : verifiedCount}</strong>
                  <span>Verified certificates</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Online verification access</span>
                </div>
              </section>

              <section className="how-section">
                <div className="section-heading">
                  <span className="eyebrow">HOW IT WORKS</span>
                  <h2>Certificate verification made easy</h2>
                  <p className="muted">
                    Find and check certificate details in just a few steps.
                  </p>
                </div>

                <div className="steps-grid">
                  <article className="step-card">
                    <div className="step-number">01</div>
                    <div className="step-icon">⌕</div>
                    <h3>Enter Certificate ID</h3>
                    <p className="muted">
                      Enter the unique ID printed on the certificate.
                    </p>
                  </article>

                  <article className="step-card">
                    <div className="step-number">02</div>
                    <div className="step-icon">✓</div>
                    <h3>Verify the Record</h3>
                    <p className="muted">
                      CertiCloud checks the ID against saved records.
                    </p>
                  </article>

                  <article className="step-card">
                    <div className="step-number">03</div>
                    <div className="step-icon">▤</div>
                    <h3>View the Result</h3>
                    <p className="muted">
                      Review the certificate status and available details.
                    </p>
                  </article>
                </div>
              </section>

              <section className="public-cta">
                <div>
                  <h2>Have a certificate to verify?</h2>
                  <p>
                    Check its record using the unique certificate ID.
                  </p>
                </div>
                <button
                  className="button-primary"
                  type="button"
                  onClick={() => navigate("Verify Certificate")}
                >
                  Verify Now →
                </button>
              </section>
            </>
          )}

          {page === "Dashboard" && (
            <>
              <section className="welcome">
                <span className="eyebrow">OVERVIEW</span>
                <h1>Welcome to your Dashboard</h1>
                <p className="muted">
                  Monitor certificate records and manage verification status.
                </p>
              </section>

              <div className="stats-grid">
                <section className="stat-card">
                  <div className="stat-top">
                    <span>Total Certificates</span>
                    <span className="stat-icon blue">▤</span>
                  </div>
                  <div className="stat-number">
                    {loading ? "…" : certificates.length}
                  </div>
                  <p className="muted">All saved records</p>
                </section>

                <section className="stat-card">
                  <div className="stat-top">
                    <span>Verified Certificates</span>
                    <span className="stat-icon green">✓</span>
                  </div>
                  <div className="stat-number">
                    {loading ? "…" : verifiedCount}
                  </div>
                  <p className="muted">Marked as verified</p>
                </section>

                <section className="stat-card">
                  <div className="stat-top">
                    <span>Pending Certificates</span>
                    <span className="stat-icon orange">◷</span>
                  </div>
                  <div className="stat-number">
                    {loading ? "…" : pendingCount}
                  </div>
                  <p className="muted">Awaiting verification</p>
                </section>
              </div>

              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Recent Certificates</h2>
                    <p className="muted">Latest saved certificate records</p>
                  </div>
                  <button
                    className="button-secondary"
                    type="button"
                    onClick={() => navigate("Records")}
                  >
                    View All Records →
                  </button>
                </div>

                {loading ? (
                  <p className="muted">Loading records...</p>
                ) : (
                  <CertificateTable
                    certificates={certificates.slice(0, 5)}
                    onDelete={deleteCertificate}
                  />
                )}
              </section>

              <section className="quick-grid">
                <button
                  className="quick-card"
                  type="button"
                  onClick={() => navigate("Verify Certificate")}
                >
                  <span className="step-icon">✓</span>
                  <strong>Verify Certificate</strong>
                  <span className="muted">Check a certificate ID →</span>
                </button>

                <button
                  className="quick-card"
                  type="button"
                  onClick={() => navigate("Add Certificate")}
                >
                  <span className="step-icon">＋</span>
                  <strong>Add Certificate</strong>
                  <span className="muted">Create a new record →</span>
                </button>
              </section>
            </>
          )}

          {page === "Verify Certificate" && (
            <section className="verify-panel">
              <span className="eyebrow">PUBLIC VERIFICATION</span>
              <h1>Verify Certificate</h1>
              <p className="muted">
                Enter the unique certificate ID to check its validity.
              </p>

              <form className="verify-form" onSubmit={verifyCertificate}>
                <label>
                  Certificate ID
                  <input
                    value={verifyId}
                    onChange={(event) => setVerifyId(event.target.value)}
                    placeholder="e.g. CERT-2026-001"
                    required
                  />
                </label>

                <button className="button-primary" type="submit">
                  Verify Certificate
                </button>
              </form>

              {verification && (
                <div
                  className={`verification-result ${
                    verification.valid ? "success" : "error"
                  }`}
                >
                  <h3>
                    {verification.valid
                      ? "✓ Certificate is valid"
                      : "Certificate not verified"}
                  </h3>
                  <p>{verification.message}</p>

                  {verification.certificate && (
                    <div className="detail-grid">
                      <div>
                        <span>Student</span>
                        <strong>
                          {verification.certificate.studentName}
                        </strong>
                      </div>
                      <div>
                        <span>Course</span>
                        <strong>
                          {verification.certificate.courseName}
                        </strong>
                      </div>
                      <div>
                        <span>Certificate ID</span>
                        <strong>
                          {verification.certificate.certificateId}
                        </strong>
                      </div>
                      <div>
                        <span>Issue Date</span>
                        <strong>
                          {verification.certificate.issueDate}
                        </strong>
                      </div>
                      <div>
                        <span>Status</span>
                        <strong>
                          {displayStatus(verification.certificate.status)}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {page === "Records" && (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h1>Certificate Records</h1>
                  <p className="muted">
                    Search, view, and delete saved certificates.
                  </p>
                </div>

                <button
                  className="button-primary"
                  type="button"
                  onClick={() => navigate("Add Certificate")}
                >
                  ＋ Add Certificate
                </button>
              </div>

              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ID, student, or course..."
              />

              {loading ? (
                <p className="muted">Loading records...</p>
              ) : (
                <CertificateTable
                  certificates={filteredCertificates}
                  onDelete={deleteCertificate}
                />
              )}
            </section>
          )}

          {page === "Add Certificate" && (
            <section className="add-panel">
              <span className="eyebrow">CERTIFICATE MANAGEMENT</span>
              <h1>Add Certificate</h1>
              <p className="muted">
                Enter the certificate details below to create a record.
              </p>

              <form className="add-form" onSubmit={addCertificate}>
                <label>
                  Certificate ID
                  <input
                    value={certificateId}
                    onChange={(event) =>
                      setCertificateId(event.target.value)
                    }
                    placeholder="e.g. CERT-2026-001"
                    required
                  />
                </label>

                <label>
                  Student Name
                  <input
                    value={studentName}
                    onChange={(event) => setStudentName(event.target.value)}
                    placeholder="Enter student name"
                    required
                  />
                </label>

                <label>
                  Course Name
                  <input
                    value={courseName}
                    onChange={(event) => setCourseName(event.target.value)}
                    placeholder="Enter course name"
                    required
                  />
                </label>

                <label>
                  Issue Date
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(event) => setIssueDate(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Certificate Status
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                  </select>
                </label>

                <button className="button-primary" type="submit">
                  Save Certificate
                </button>
              </form>
            </section>
          )}

          <footer className="page-footer">
            © {new Date().getFullYear()} CertiCloud · Secure Certificate
            Management
          </footer>
        </main>
      </div>
    </div>
  );
}

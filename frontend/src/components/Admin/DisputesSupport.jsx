import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import "./DisputesSupport.css";

const initialTickets = [
  {
    id: "TKT00156",
    subject: "Item not received",
    user: "Rahul Kumar",
    email: "rahul@gmail.com",
    avatar: "R",
    avatarColor: "blue",
    order: "ORD001245",
    category: "Order Issue",
    priority: "High",
    status: "Open",
    created: "10 Sep, 2026",
    time: "10:30 AM",
    description:
      "I have not received my item even after the auction ended and payment was successful. Please look into this issue and provide a resolution.",
    attachments: [
      { type: "document", label: "Order details" },
      { type: "image", label: "Package photo" },
    ],
  },
  {
    id: "TKT00155",
    subject: "Refund request for cancelled auction",
    user: "Priya Sharma",
    email: "priya@gmail.com",
    avatar: "P",
    avatarColor: "pink",
    order: "ORD001230",
    category: "Refund",
    priority: "Medium",
    status: "In Progress",
    created: "9 Sep, 2026",
    time: "2:18 PM",
    description:
      "I cancelled my auction order and would like to know when my refund will be processed.",
    attachments: [],
  },
  {
    id: "TKT00154",
    subject: "Product quality issue",
    user: "Amit Patel",
    email: "amit@gmail.com",
    avatar: "A",
    avatarColor: "blue",
    order: "ORD001220",
    category: "Product Issue",
    priority: "High",
    status: "Open",
    created: "8 Sep, 2026",
    time: "11:05 AM",
    description:
      "The product I received does not match the quality described in the listing.",
    attachments: [],
  },
  {
    id: "TKT00153",
    subject: "Unauthorized bid activity",
    user: "Sneha Das",
    email: "sneha@gmail.com",
    avatar: "S",
    avatarColor: "mint",
    order: "AUC00118",
    category: "Auction Issue",
    priority: "High",
    status: "Escalated",
    created: "7 Sep, 2026",
    time: "5:25 PM",
    description:
      "I noticed bidding activity on my auction that I did not authorize. Please investigate.",
    attachments: [],
  },
  {
    id: "TKT00152",
    subject: "Payment failed but amount deducted",
    user: "Arjun Singh",
    email: "arjun@gmail.com",
    avatar: "A",
    avatarColor: "green",
    order: "ORD001210",
    category: "Payment Issue",
    priority: "Medium",
    status: "In Progress",
    created: "6 Sep, 2026",
    time: "9:15 AM",
    description:
      "My payment failed, but the amount was deducted from my bank account.",
    attachments: [],
  },
  {
    id: "TKT00151",
    subject: "Seller not responding",
    user: "Neha Verma",
    email: "neha@gmail.com",
    avatar: "N",
    avatarColor: "purple",
    order: "AUC00120",
    category: "Seller Issue",
    priority: "Low",
    status: "Resolved",
    created: "5 Sep, 2026",
    time: "1:48 PM",
    description:
      "The seller has not responded to my messages regarding the delivery.",
    attachments: [],
  },
  {
    id: "TKT00150",
    subject: "Wrong item delivered",
    user: "Rohan Mehta",
    email: "rohan@gmail.com",
    avatar: "R",
    avatarColor: "pink",
    order: "ORD001200",
    category: "Order Issue",
    priority: "High",
    status: "Open",
    created: "4 Sep, 2026",
    time: "3:35 PM",
    description: "I received a different product from the one I purchased.",
    attachments: [],
  },
  {
    id: "TKT00149",
    subject: "Account access issue",
    user: "Anya Roy",
    email: "anya@gmail.com",
    avatar: "A",
    avatarColor: "blue",
    order: "—",
    category: "Account Issue",
    priority: "Medium",
    status: "Resolved",
    created: "3 Sep, 2026",
    time: "12:28 PM",
    description:
      "I am unable to access my account after resetting my password.",
    attachments: [],
  },
];

const tabs = [
  { label: "All Tickets", value: "All", count: 56 },
  { label: "Open", value: "Open", count: 18 },
  { label: "In Progress", value: "In Progress", count: 14 },
  { label: "Resolved", value: "Resolved", count: 32 },
  { label: "Escalated", value: "Escalated", count: 6 },
];

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");

  return (
    <span className={`ticket-status ${statusClass}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`ticket-priority ${priority.toLowerCase()}`}>
      <span className="priority-dot" />
      {priority}
    </span>
  );
}

export default function DisputesSupport() {
  const [tickets, setTickets] = useState(initialTickets);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [priority, setPriority] = useState("All Priority");
  const [selectedTicket, setSelectedTicket] = useState(initialTickets[0]);
  const [page, setPage] = useState(1);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesTab = activeTab === "All" || ticket.status === activeTab;

      const matchesSearch = [
        ticket.id,
        ticket.subject,
        ticket.user,
        ticket.order,
        ticket.email,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" || ticket.category === category;

      const matchesStatus = status === "All Status" || ticket.status === status;

      const matchesPriority =
        priority === "All Priority" || ticket.priority === priority;

      return (
        matchesTab &&
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [tickets, activeTab, search, category, status, priority]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const openTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyOpen(false);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setStatus("All Status");
    setPriority("All Priority");
    setActiveTab("All");
    setPage(1);
  };

  const updateTicketStatus = (ticket, newStatus) => {
    setTickets((previous) =>
      previous.map((item) =>
        item.id === ticket.id ? { ...item, status: newStatus } : item,
      ),
    );

    setSelectedTicket((previous) =>
      previous?.id === ticket.id
        ? { ...previous, status: newStatus }
        : previous,
    );
  };

  const handleReply = () => {
    if (!replyText.trim()) return;

    alert(`Reply submitted for ${selectedTicket?.id}`);
    setReplyText("");
    setReplyOpen(false);
  };

  const handleCreateTicket = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const subject = formData.get("subject");
    const description = formData.get("description");

    const newTicket = {
      id: `TKT${String(Date.now()).slice(-5)}`,
      subject,
      user: "Admin",
      email: "admin@eauction.com",
      avatar: "A",
      avatarColor: "green",
      order: "—",
      category: formData.get("category"),
      priority: formData.get("priority"),
      status: "Open",
      created: new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      description,
      attachments: [],
    };

    setTickets((previous) => [newTicket, ...previous]);
    setSelectedTicket(newTicket);
    setActiveTab("All");
    setSearch("");
    setCategory("All Categories");
    setStatus("All Status");
    setPriority("All Priority");
    setPage(1);
    setShowNewTicket(false);
  };

  return (
    <main className="disputes-page">
      <header className="disputes-page-header">
        <div>
          <h1>Disputes &amp; Support</h1>
          <p>Manage user disputes, refund requests, and support tickets.</p>
        </div>

        <div className="disputes-date">
          <CalendarDays size={19} />
          <span>Fri, 11 Sep, 2026</span>
        </div>
      </header>

      <section className="disputes-stats-grid">
        <article className="disputes-stat-card red">
          <div className="disputes-stat-icon">
            <AlertCircle size={28} />
          </div>
          <div className="disputes-stat-info">
            <span>Total Tickets</span>
            <div className="disputes-stat-value">
              <strong>56</strong>
              <span className="stat-growth positive">↑ 18%</span>
            </div>
            <small>vs last month</small>
          </div>
        </article>

        <article className="disputes-stat-card orange">
          <div className="disputes-stat-icon">
            <Clock3 size={28} />
          </div>
          <div className="disputes-stat-info">
            <span>Open Tickets</span>
            <div className="disputes-stat-value">
              <strong>18</strong>
              <span className="stat-growth positive">↑ 25%</span>
            </div>
            <small>vs last month</small>
          </div>
        </article>

        <article className="disputes-stat-card blue">
          <div className="disputes-stat-icon">
            <CheckCircle2 size={28} />
          </div>
          <div className="disputes-stat-info">
            <span>Resolved Tickets</span>
            <div className="disputes-stat-value">
              <strong>32</strong>
              <span className="stat-growth positive">↑ 12%</span>
            </div>
            <small>vs last month</small>
          </div>
        </article>

        <article className="disputes-stat-card red">
          <div className="disputes-stat-icon">
            <XCircle size={28} />
          </div>
          <div className="disputes-stat-info">
            <span>Escalated Tickets</span>
            <div className="disputes-stat-value">
              <strong>6</strong>
              <span className="stat-growth negative">↑ 50%</span>
            </div>
            <small>vs last month</small>
          </div>
        </article>
      </section>

      <section className="disputes-workspace">
        <div className="disputes-main-panel">
          <div className="disputes-tabs">
            <div className="disputes-tab-list">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  className={`disputes-tab ${
                    activeTab === tab.value ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setPage(1);
                  }}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <button
              className="disputes-primary-button new-ticket-button"
              onClick={() => setShowNewTicket(true)}
            >
              <Plus size={20} />
              New Ticket
            </button>
          </div>

          <div className="disputes-filters">
            <div className="disputes-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by ticket ID, user, order ID, or subject..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              <option>All Categories</option>
              <option>Order Issue</option>
              <option>Refund</option>
              <option>Product Issue</option>
              <option>Auction Issue</option>
              <option>Payment Issue</option>
              <option>Seller Issue</option>
              <option>Account Issue</option>
            </select>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option>All Status</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Escalated</option>
            </select>

            <select
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value);
                setPage(1);
              }}
            >
              <option>All Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <button className="disputes-reset-button" onClick={resetFilters}>
              <RotateCcw size={17} />
              Reset
            </button>
          </div>

          <div className="disputes-table-wrapper">
            <table className="disputes-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" aria-label="Select all tickets" />
                  </th>
                  <th>Ticket ID</th>
                  <th>Subject</th>
                  <th>User</th>
                  <th>Related Order</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedTickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className={
                      selectedTicket?.id === ticket.id ? "selected-row" : ""
                    }
                  >
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${ticket.id}`}
                      />
                    </td>
                    <td className="ticket-id">{ticket.id}</td>
                    <td className="ticket-subject">{ticket.subject}</td>
                    <td>
                      <div className="ticket-user">
                        <span className={`ticket-avatar ${ticket.avatarColor}`}>
                          {ticket.avatar}
                        </span>
                        <div>
                          <strong>{ticket.user}</strong>
                          <small>{ticket.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="ticket-order">{ticket.order}</td>
                    <td>
                      <span
                        className={`ticket-category ${ticket.category
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {ticket.category}
                      </span>
                    </td>
                    <td>
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="ticket-date">
                      {ticket.created}
                      <small>{ticket.time}</small>
                    </td>
                    <td>
                      <div className="ticket-actions">
                        <button
                          title="View ticket"
                          onClick={() => openTicket(ticket)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          title="Reply to ticket"
                          onClick={() => {
                            openTicket(ticket);
                            setReplyOpen(true);
                          }}
                        >
                          <MessageSquare size={17} />
                        </button>
                        <button
                          title="More options"
                          onClick={() => openTicket(ticket)}
                        >
                          <MoreHorizontal size={19} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedTickets.length === 0 && (
                  <tr>
                    <td colSpan="10" className="disputes-empty-state">
                      No tickets match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="disputes-pagination">
            <span>
              Showing{" "}
              {filteredTickets.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –{Math.min(currentPage * pageSize, filteredTickets.length)} of{" "}
              {filteredTickets.length} tickets
            </span>

            <div className="pagination-buttons">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft size={18} />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(0, 5)
                .map((number) => (
                  <button
                    key={number}
                    className={currentPage === number ? "active" : ""}
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ))}

              {totalPages > 5 && (
                <span className="pagination-ellipsis">...</span>
              )}

              {totalPages > 5 && (
                <button onClick={() => setPage(totalPages)}>
                  {totalPages}
                </button>
              )}

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((previous) => Math.min(totalPages, previous + 1))
                }
                aria-label="Next page"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <aside className="ticket-details-panel">
          <div className="ticket-details-header">
            <h2>Ticket Details</h2>
            <button
              aria-label="Close ticket details"
              onClick={() => setSelectedTicket(null)}
            >
              <X size={20} />
            </button>
          </div>

          {selectedTicket ? (
            <>
              <div className="ticket-details-summary">
                <span
                  className={`ticket-avatar large ${selectedTicket.avatarColor}`}
                >
                  {selectedTicket.avatar}
                </span>
                <div className="ticket-details-title">
                  <strong>{selectedTicket.id}</strong>
                  <span>{selectedTicket.subject}</span>
                  <small>
                    Created on {selectedTicket.created} {selectedTicket.time}
                  </small>
                </div>
                <StatusBadge status={selectedTicket.status} />
              </div>

              <div className="ticket-details-fields">
                <div>
                  <span>User</span>
                  <p>
                    {selectedTicket.user}
                    <small>{selectedTicket.email}</small>
                  </p>
                </div>
                <div>
                  <span>Related Order</span>
                  <p>{selectedTicket.order}</p>
                </div>
                <div>
                  <span>Category</span>
                  <p>
                    <span
                      className={`ticket-category ${selectedTicket.category
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {selectedTicket.category}
                    </span>
                  </p>
                </div>
                <div>
                  <span>Priority</span>
                  <p>
                    <PriorityBadge priority={selectedTicket.priority} />
                  </p>
                </div>
                <div>
                  <span>Status</span>
                  <p>
                    <StatusBadge status={selectedTicket.status} />
                  </p>
                </div>
              </div>

              <div className="ticket-description">
                <h3>Description</h3>
                <p>{selectedTicket.description}</p>
              </div>

              <div className="ticket-attachments">
                <div className="ticket-attachments-header">
                  <h3>Attachments ({selectedTicket.attachments.length})</h3>
                  <button
                    onClick={() => alert("Attachment list opened")}
                    disabled={!selectedTicket.attachments.length}
                  >
                    View All
                  </button>
                </div>

                {selectedTicket.attachments.length ? (
                  <div className="ticket-attachment-list">
                    {selectedTicket.attachments.map((attachment, index) => (
                      <div className="ticket-attachment" key={index}>
                        <Paperclip size={18} />
                        <span>{attachment.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-attachments">No attachments available.</p>
                )}
              </div>

              <div className="ticket-detail-actions">
                {selectedTicket.status !== "Resolved" && (
                  <button
                    className="disputes-primary-button"
                    onClick={() => setReplyOpen((previous) => !previous)}
                  >
                    <MessageSquare size={17} />
                    Reply to Ticket
                  </button>
                )}

                {selectedTicket.status !== "Resolved" && (
                  <button
                    className="disputes-outline-button"
                    onClick={() =>
                      updateTicketStatus(selectedTicket, "Resolved")
                    }
                  >
                    <CheckCircle2 size={17} />
                    Mark Resolved
                  </button>
                )}

                {selectedTicket.status === "Resolved" && (
                  <button
                    className="disputes-outline-button"
                    onClick={() => updateTicketStatus(selectedTicket, "Open")}
                  >
                    Reopen Ticket
                  </button>
                )}
              </div>

              {replyOpen && (
                <div className="ticket-reply-box">
                  <label htmlFor="ticket-reply">Your reply</label>
                  <textarea
                    id="ticket-reply"
                    rows="4"
                    placeholder="Write a reply to the user..."
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                  />
                  <button
                    className="disputes-primary-button"
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                  >
                    Send Reply <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="ticket-no-selection">
              <MessageSquare size={32} />
              <p>Select a ticket to view its details.</p>
            </div>
          )}
        </aside>
      </section>

      {showNewTicket && (
        <div
          className="disputes-modal-backdrop"
          onClick={() => setShowNewTicket(false)}
        >
          <div
            className="disputes-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="disputes-modal-header">
              <h2>Create New Ticket</h2>
              <button
                onClick={() => setShowNewTicket(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket}>
              <label>
                Subject
                <input
                  name="subject"
                  type="text"
                  placeholder="Enter ticket subject"
                  required
                />
              </label>

              <label>
                Category
                <select name="category" required>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Refund">Refund</option>
                  <option value="Product Issue">Product Issue</option>
                  <option value="Auction Issue">Auction Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Seller Issue">Seller Issue</option>
                  <option value="Account Issue">Account Issue</option>
                </select>
              </label>

              <label>
                Priority
                <select name="priority" required>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  rows="5"
                  placeholder="Describe the issue..."
                  required
                />
              </label>

              <div className="disputes-modal-actions">
                <button
                  type="button"
                  className="disputes-outline-button"
                  onClick={() => setShowNewTicket(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="disputes-primary-button">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

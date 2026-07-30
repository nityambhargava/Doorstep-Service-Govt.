import { Check, Send } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AGENTS, WEEKLY_TREND } from '../data/bookings';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';

function AgentCell({ booking, onAssignAgent }) {
  if (booking.agent) return <>{booking.agent}</>;
  return (
    <select
      onChange={(e) => onAssignAgent(booking.id, e.target.value)}
      defaultValue=""
      className="assign-select"
    >
      <option value="" disabled>Assign agent</option>
      {AGENTS.map((a) => <option key={a} value={a}>{a}</option>)}
    </select>
  );
}

export default function AdminView({ bookings, onAssignAgent, onVerify, onSubmit }) {
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});
  const awaitingVerification = bookings.filter((b) => b.status === 'completed');

  return (
    <div>
      <p className="agent-eyebrow">Gurugram district · Today</p>
      <h2 className="view-title mb-4">Doorstep operations</h2>

      <div className="stats-grid">
        <StatCard label="Total visits" value={bookings.length} />
        <StatCard label="Scheduled" value={counts.scheduled || 0} />
        <StatCard label="On visit" value={counts.in_progress || 0} />
        <StatCard label="Awaiting verification" value={counts.completed || 0} accent />
        <StatCard label="Submitted to SARAL" value={counts.submitted || 0} />
      </div>

      <div className="admin-grid mt-5">
        <div className="panel">
          <p className="section-label">Weekly visit volume</p>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--ink-soft)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'var(--indigo-soft)' }} />
                <Bar dataKey="visits" fill="var(--indigo)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <p className="section-label">Verification queue</p>
          {awaitingVerification.length === 0 ? (
            <p className="empty-note">Nothing waiting on office verification.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {awaitingVerification.map((b) => (
                <div key={b.id} className="queue-row">
                  <div>
                    <p className="visit-name" style={{ fontSize: 13.5 }}>{b.citizen}</p>
                    <p className="visit-meta">{b.service} · {b.agent}</p>
                  </div>
                  <button onClick={() => onVerify(b.id)} className="btn-secondary flex items-center gap-1">
                    <Check size={12} /> Verify
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel mt-5">
        <p className="section-label">All bookings</p>

        {/* Table — desktop / tablet */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full booking-table">
            <thead>
              <tr>
                <th>ID</th><th>Citizen</th><th>Service</th><th>Area</th><th>Slot</th><th>Agent</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="mono">{b.id}</td>
                  <td>{b.citizen}</td>
                  <td>{b.service}</td>
                  <td>{b.area}</td>
                  <td>{b.slot}</td>
                  <td><AgentCell booking={b} onAssignAgent={onAssignAgent} /></td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    {b.status === 'verified' && (
                      <button onClick={() => onSubmit(b.id)} className="btn-secondary flex items-center gap-1">
                        <Send size={12} /> Submit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile */}
        <div className="md:hidden flex flex-col gap-2">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="visit-name" style={{ fontSize: 13.5 }}>{b.citizen}</p>
                  <p className="visit-meta">{b.service}</p>
                  <p className="visit-meta">{b.area} · {b.slot}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--line)' }}>
                <span className="mono">{b.id}</span>
                <AgentCell booking={b} onAssignAgent={onAssignAgent} />
              </div>
              {b.status === 'verified' && (
                <button onClick={() => onSubmit(b.id)} className="btn-secondary flex items-center gap-1 mt-2 w-full justify-center">
                  <Send size={12} /> Submit to SARAL
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
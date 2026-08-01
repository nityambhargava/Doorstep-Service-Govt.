import { useState } from 'react';
import { MapPin, Clock, FileText } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VisitDetail from './VisitDetail';

export default function FieldAgentView({
  agentName,
  bookings,
  onStartVisit,
  onToggleChecklist,
  onSaveSignature,
  onCompleteVisit,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const selected = bookings.find((b) => b.id === selectedId);

  if (selected) {
    return (
      <VisitDetail
        booking={selected}
        onBack={() => setSelectedId(null)}
        onStartVisit={onStartVisit}
        onToggleChecklist={onToggleChecklist}
        onSaveSignature={onSaveSignature}
        onCompleteVisit={onCompleteVisit}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <p className="agent-eyebrow">Today · {bookings.length} visits</p>
      <h2 className="view-title mb-4">Good morning, {agentName.split(' ')[0]}</h2>
      <div className="flex flex-col gap-3">
        {bookings.map((b) => (
          <button key={b.id} onClick={() => setSelectedId(b.id)} className="visit-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="visit-name">{b.citizen}</p>
                <p className="visit-meta"><FileText size={13} /> {b.service}</p>
                <p className="visit-meta"><MapPin size={13} /> {b.area}</p>
                <p className="visit-meta"><Clock size={13} /> {b.slot}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
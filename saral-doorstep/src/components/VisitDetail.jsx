import { MapPin, Clock, FileText, PenTool, ChevronLeft, Check } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ChecklistRow from './ChecklistRow';
import SignaturePad from './SignaturePad';

export default function VisitDetail({
  booking,
  onBack,
  onStartVisit,
  onToggleChecklist,
  onSaveSignature,
  onCompleteVisit,
}) {
  const allChecked = booking.checklist.idProof && booking.checklist.form && booking.checklist.photo;
  const canComplete = allChecked && booking.signature;

  return (
    <div className="max-w-md mx-auto">
      <button onClick={onBack} className="back-btn"><ChevronLeft size={16} /> All visits</button>

      <div className="detail-card">
        <p className="visit-name" style={{ fontSize: 16 }}>{booking.citizen}</p>
        <p className="visit-meta"><FileText size={13} /> {booking.service}</p>
        <p className="visit-meta"><MapPin size={13} /> {booking.area}</p>
        <p className="visit-meta"><Clock size={13} /> {booking.slot}</p>
        <div className="mt-3"><StatusBadge status={booking.status} /></div>
      </div>

      {booking.status === 'scheduled' && (
        <button onClick={() => onStartVisit(booking.id)} className="btn-primary w-full mt-4">
          Start visit
        </button>
      )}

      {booking.status === 'in_progress' && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="checklist-card">
            <p className="section-label">On-site checklist</p>
            <ChecklistRow label="ID proof collected" checked={booking.checklist.idProof} onClick={() => onToggleChecklist(booking.id, 'idProof')} />
            <ChecklistRow label="Application form filled" checked={booking.checklist.form} onClick={() => onToggleChecklist(booking.id, 'form')} />
            <ChecklistRow label="Photo captured" checked={booking.checklist.photo} onClick={() => onToggleChecklist(booking.id, 'photo')} />
          </div>

          <div className="checklist-card">
            <p className="section-label flex items-center gap-1"><PenTool size={12} /> Citizen signature</p>
            {booking.signature ? (
              <p className="text-sm flex items-center gap-1" style={{ color: 'var(--green)' }}>
                <Check size={14} /> Signature captured
              </p>
            ) : (
              <SignaturePad onSave={(d) => onSaveSignature(booking.id, d)} />
            )}
          </div>

          <button disabled={!canComplete} onClick={() => onCompleteVisit(booking.id)} className="btn-primary w-full">
            Mark visit complete
          </button>
        </div>
      )}

      {['completed', 'verified', 'submitted'].includes(booking.status) && (
        <div className="stamp-moment">
          <div className="big-stamp">Visit complete</div>
          <p className="text-sm mt-3" style={{ color: 'var(--ink-soft)' }}>
            {booking.status === 'completed' && 'Sent to office for verification.'}
            {booking.status === 'verified' && 'Verified by office — pending submission.'}
            {booking.status === 'submitted' && 'Submitted to the SARAL portal.'}
          </p>
        </div>
      )}
    </div>
  );
}
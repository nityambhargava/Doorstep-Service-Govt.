import { CheckCircle2, Circle } from 'lucide-react';

export default function ChecklistRow({ label, checked, onClick }) {
  return (
    <button onClick={onClick} className="checklist-row">
      {checked
        ? <CheckCircle2 size={18} style={{ color: 'var(--green)' }} />
        : <Circle size={18} style={{ color: 'var(--line)' }} />}
      <span style={{ textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.55 : 1 }}>
        {label}
      </span>
    </button>
  );
}
import { STATUS_LABEL } from '../data/bookings';

export default function StatusBadge({ status }) {
  if (status === 'verified' || status === 'submitted') {
    return (
      <span className={`badge-stamp ${status === 'submitted' ? 'submitted' : ''}`}>
        {STATUS_LABEL[status]}
      </span>
    );
  }
  return <span className={`badge-pill ${status}`}>{STATUS_LABEL[status]}</span>;
}
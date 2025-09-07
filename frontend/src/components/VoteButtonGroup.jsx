import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { formatNumbers } from '../utils/formatNumbers';

function VoteButtonGroup({ userVote, totalVotes, onVote }) {
  const getBorderColor = () => {
    if (userVote === 1) return 'border-danger';
    if (userVote === -1) return 'border-primary';
    return 'border-secondary';
  };

  const getArrowColor = (direction) => {
    if (userVote === direction) {
      return direction === 1 ? 'text-danger' : 'text-primary';
    }
    return 'text-secondary';
  };

  return (
    <div
      className={`d-flex align-items-center mt-2 rounded-pill px-2 py-1 bg-light border ${getBorderColor()}`}
      style={{ width: 'min-content' }}
    >
      <button
        className={`vote-btn me-2 border-0 bg-transparent ${getArrowColor(1)}`}
        onClick={(e) => {
          e.stopPropagation();
          onVote(1);
        }}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>

      <span
        className="mx-2"
        style={{
          minWidth: '3ch',
          display: 'inline-block',
          textAlign: 'center',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: 'black',
        }}
      >
        {formatNumbers(totalVotes)}
      </span>

      <button
        className={`vote-btn ms-2 border-0 bg-transparent ${getArrowColor(-1)}`}
        onClick={(e) => {
          e.stopPropagation();
          onVote(-1);
        }}
      >
        <FontAwesomeIcon icon={faArrowDown} />
      </button>
    </div>
  );
}

export default VoteButtonGroup;

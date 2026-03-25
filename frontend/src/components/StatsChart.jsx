import React from "react";

export default function StatsChart({ stats }) {
  const total = stats.total || 0;
  const completed = stats.completed || 0;
  const pending = stats.pending || 0;
  const inProgress = stats.in_progress || 0;
  const overdue = stats.overdue || 0;

  if (total === 0) {
    return (
      <div className="stats-chart">
        <p>No tasks available</p>
      </div>
    );
  }

  const completedPercent = (completed / total) * 100;
  const pendingPercent = (pending / total) * 100;
  const inProgressPercent = (inProgress / total) * 100;
  const overduePercent = (overdue / total) * 100;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  let currentAngle = -90; // Start from top
  
  const createSegment = (percent, color, offset = 0) => {
    const angle = (percent / 100) * 360;
    const startAngle = currentAngle + offset;
    const endAngle = startAngle + angle;
    currentAngle = endAngle;
    
    const x1 = 50 + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="stats-chart">
      <svg viewBox="0 0 100 100" className="donut-chart">
        {completedPercent > 0 && (
          <path
            d={createSegment(completedPercent, "#34d37e")}
            fill="#34d37e"
            className="chart-segment"
          />
        )}
        {inProgressPercent > 0 && (
          <path
            d={createSegment(inProgressPercent, "#f5c842")}
            fill="#f5c842"
            className="chart-segment"
          />
        )}
        {pendingPercent > 0 && (
          <path
            d={createSegment(pendingPercent, "#5b6af0")}
            fill="#5b6af0"
            className="chart-segment"
          />
        )}
        {overduePercent > 0 && (
          <path
            d={createSegment(overduePercent, "#f05252")}
            fill="#f05252"
            className="chart-segment"
          />
        )}
        <circle cx="50" cy="50" r="25" fill="#0d0f14" />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#e8eaf2"
          fontSize="12"
          fontWeight="600"
        >
          {Math.round(completedPercent)}%
        </text>
      </svg>
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#34d37e" }}></div>
          <span>Completed ({completed})</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#f5c842" }}></div>
          <span>In Progress ({inProgress})</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#5b6af0" }}></div>
          <span>Pending ({pending})</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: "#f05252" }}></div>
          <span>Overdue ({overdue})</span>
        </div>
      </div>
    </div>
  );
}
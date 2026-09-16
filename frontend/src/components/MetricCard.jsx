import { motion } from "framer-motion";


export default function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  accent = "neutral",
}) {

  return (
    <motion.div
      className={
        `metric-card metric-${accent}`
      }
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      transition={{
        duration: 0.2,
      }}
    >

      <div className="metric-top">

        <span>
          {label}
        </span>

        <div className="metric-icon">
          <Icon size={18} />
        </div>

      </div>

      <strong>
        {value}
      </strong>

      <small>
        {detail}
      </small>

    </motion.div>
  );
}

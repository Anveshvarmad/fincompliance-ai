import { motion } from "framer-motion";


export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}) {

  return (
    <motion.section
      className="page-header"
      initial={{
        opacity: 0,
        y: 24,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.55,
      }}
    >

      <div>

        <span className="eyebrow">
          {eyebrow}
        </span>

        <h1>
          {title}
        </h1>

        <p>
          {description}
        </p>

      </div>

      {children && (
        <div className="page-actions">
          {children}
        </div>
      )}

    </motion.section>
  );
}

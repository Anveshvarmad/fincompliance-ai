import { motion, useScroll, useTransform } from "framer-motion";


export default function AmbientBackground() {

  const { scrollY } = useScroll();

  const layerOne = useTransform(
    scrollY,
    [0, 1000],
    [0, 180]
  );

  const layerTwo = useTransform(
    scrollY,
    [0, 1000],
    [0, -110]
  );


  return (
    <div className="ambient-background">

      <motion.div
        className="ambient-orb ambient-orb-one"
        style={{
          y: layerOne,
        }}
      />

      <motion.div
        className="ambient-orb ambient-orb-two"
        style={{
          y: layerTwo,
        }}
      />

      <div className="ambient-grid" />

      <div className="ambient-noise" />

    </div>
  );
}

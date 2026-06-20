import "./lookbook.css";

import Orb from "@/components/Orb/Orb";
import Copy from "@/components/Copy/Copy";

export default function Lookbook() {
  return (
    <section className="lookbook">
      <div className="section-footer">
        <Copy animateOnScroll={false} delay={0.65} type="flicker">
          <p>[ Look Stream ]</p>
        </Copy>
        <Copy animateOnScroll={false} delay={0.65} type="flicker">
          <p>[ View Matrix ]</p>
        </Copy>
      </div>
      <Orb />
    </section>
  );
}

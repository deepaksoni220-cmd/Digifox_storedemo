import "./TextBlock.css";

import Copy from "../Copy/Copy";
import BrandIcon from "../BrandIcon/BrandIcon";

const TextBlock = () => {
  return (
    <section className="text-block">
      <div className="container">
        <div className="text-block-col">
          <Copy>
            <h3>Designed absence, engineered silence.</h3>
          </Copy>
          <div className="text-block-logo">
            <BrandIcon />
          </div>
        </div>
        <div className="text-block-col">
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                Designed for quiet tension. Built on structure, not spectacle.
                Each piece functions with intent, nothing more. Neutral in tone,
                deliberate in volume, uniform for moving through static.
              </p>
            </Copy>
          </div>
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                No ornament. No history. Just form engineered to remain.
                Indifferent to season, untouched by noise. Modular in cut,
                detached in presence. A system for those who exit the frame.
              </p>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextBlock;

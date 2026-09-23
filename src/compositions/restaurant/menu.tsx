import { allergenLabels, formatMenuPrice, type Menu, type MenuItem } from "@/domain/gastronomy/menu";

import { isVisible, show, type SiteModel } from "./model";
import styles from "./menu.module.css";
import { DraftBlock, Placeholder, Section, SectionHead } from "./primitives";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function ItemMeta({ item }: { item: MenuItem }) {
  const allergens = allergenLabels(item);
  const tags = item.dietary.filter((tag) => tag !== "scharf");
  return (
    <>
      {item.description ? <p className={styles.description}>{item.description}</p> : null}
      {tags.length > 0 || item.dietary.includes("scharf") || allergens.length > 0 ? (
        <p className={styles.meta}>
          {[...tags, ...(item.dietary.includes("scharf") ? ["scharf"] : [])].join(" · ")}
          {tags.length > 0 || item.dietary.includes("scharf") ? (allergens.length > 0 ? " · " : "") : ""}
          {allergens.length > 0 ? `Allergene: ${allergens.join(", ")}` : ""}
        </p>
      ) : null}
    </>
  );
}

function Typographic({ menu }: { menu: Menu }) {
  return (
    <div className={styles.typographic}>
      {menu.sections.map((section) => (
        <section key={section.title} className={styles.group} aria-label={section.title}>
          <h3 className={styles.groupTitle}>{section.title}</h3>
          {section.note ? <p className={styles.groupNote}>{section.note}</p> : null}
          <ul className={styles.list}>
            {section.items.map((item) => (
              <li key={item.name} className={styles.item}>
                <p className={styles.row}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.leader} aria-hidden="true" />
                  <span className={styles.price}>{formatMenuPrice(item)}</span>
                </p>
                <ItemMeta item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Cards({ menu }: { menu: Menu }) {
  return (
    <div className={styles.cardsWrap}>
      {menu.sections.map((section) => (
        <section key={section.title} className={styles.cardGroup} aria-label={section.title}>
          <h3 className={styles.cardGroupTitle}>{section.title}</h3>
          <ul className={styles.cards}>
            {section.items.map((item) => (
              <li key={item.name} className={styles.card}>
                <p className={styles.cardName}>{item.name}</p>
                <p className={styles.cardPrice}>{formatMenuPrice(item)}</p>
                <ItemMeta item={item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Courses({ menu }: { menu: Menu }) {
  return (
    <ol className={styles.courses}>
      {menu.sections.map((section, index) => (
        <li key={section.title} className={styles.course}>
          <span className={styles.numeral} aria-hidden="true">
            {ROMAN[index] ?? index + 1}
          </span>
          <div>
            <h3 className={styles.courseTitle}>{section.title}</h3>
            <ul className={styles.list}>
              {section.items.map((item) => (
                <li key={item.name} className={styles.item}>
                  <p className={styles.row}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.leader} aria-hidden="true" />
                    <span className={styles.price}>{formatMenuPrice(item)}</span>
                  </p>
                  <ItemMeta item={item} />
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function MenuSection({ model, weight, title, signature }: { model: SiteModel; weight: string; title?: string | undefined; signature?: boolean | undefined }) {
  const menu = show(model.profile.menu, model.context);
  if (menu.kind === "omit") return null;
  const layout = model.direction.layout.menu;
  return (
    <Section name="menu" id="speisekarte" weight={weight} labelledBy="speisekarte-titel" signature={signature}>
      <SectionHead label="Speisekarte" title={title ?? "Speisekarte"} id="speisekarte-titel" />
      {isVisible(menu) ? (
        <DraftBlock draft={menu.kind === "draft"}>
          {layout === "card-minimal" ? <Cards menu={menu.value} /> : layout === "course-led" ? <Courses menu={menu.value} /> : <Typographic menu={menu.value} />}
          {menu.value.note ? <p className={styles.menuNote}>{menu.value.note}</p> : null}
        </DraftBlock>
      ) : (
        <Placeholder field="menu" />
      )}
    </Section>
  );
}

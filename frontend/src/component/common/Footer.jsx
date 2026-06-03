import "../../UiverseElements.css";
import { useTranslation } from "react-i18next";

const FooterComponent = () => {
  const { t } = useTranslation("footer");
  return (
    <footer className="bbhh-footer">
      <strong>BBHH Resort</strong> &nbsp;·&nbsp; {t("copyright")} &copy; {new Date().getFullYear()}
    </footer>
  );
};

export default FooterComponent;

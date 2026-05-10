import { useTranslation } from "react-i18next";

const FooterComponent = () => {
  const { t } = useTranslation("footer");

  return (
    <footer>
      <span className="my-footer">
        {t("copyright")} &copy; {new Date().getFullYear()}
      </span>
    </footer>
  );
};

export default FooterComponent;
const FooterComponent = () => {


    return (
        <footer>
            <span className="my-footer">
                BBHH Resort | All Right Reserved &copy; {new Date().getFullYear()}
            </span>
        </footer>
    );
};

export default FooterComponent;
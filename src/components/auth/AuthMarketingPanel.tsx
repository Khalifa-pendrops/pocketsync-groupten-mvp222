import authIcon from '../../assets/images/auth-icon.png';
import bankIcons from '../../assets/images/bank-icons.png';
import topRightDecor from '../../assets/images/top-right.png';

export default function AuthMarketingPanel() {
  return (
    <aside className="auth-marketing">
      <img
        src={topRightDecor}
        alt=""
        className="auth-marketing-decor"
        aria-hidden="true"
      />

      <div className="auth-marketing-inner">
        <div className="auth-marketing-center">
          <img
            src={authIcon}
            alt="PocketSync"
            className="auth-marketing-logo"
          />

          <div className="auth-marketing-body">
            <div className="auth-marketing-copy">
              <div className="auth-marketing-copy-head">
                <h2>All your money.</h2>
                <h2>One smart dashboard.</h2>
              </div>
              <p className="auth-marketing-copy-paragraph">
                Connect your bank and fintech accounts, track spending, pay bills,
                and move money from one place.
              </p>
            </div>

            <div className="auth-marketing-banks">
              <img
                src={bankIcons}
                alt="Zenith, GTBank, Kuda, OPay, and Access Bank"
                className="auth-marketing-bank-strip"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
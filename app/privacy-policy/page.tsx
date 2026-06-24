export const metadata = {
  title: "プライバシーポリシー",
  description: "GameDashのプライバシーポリシー。収集する情報と利用目的について。",
  openGraph: {
    title: "プライバシーポリシー | GameDash",
    description: "GameDashのプライバシーポリシー。収集する情報と利用目的について。",
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">プライバシーポリシー</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. 収集する情報</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトでは、サービス向上のため以下の情報を収集する場合があります：
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
            <li>アクセスログ（IPアドレス、ブラウザ種別、アクセス日時）</li>
            <li>Cookie情報</li>
            <li>ユーザーが入力した情報（メールアドレスなど）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 情報の利用目的</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>サービスの改善・開発</li>
            <li>お問い合わせへの対応</li>
            <li>広告の配信・効果測定</li>
            <li>利用状況の分析</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 情報の第三者提供</h2>
          <p className="text-gray-600 leading-relaxed">
            法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. 広告について</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトではGoogle AdSenseを使用しています。Google AdSenseはCookieを使用して、ユーザーの過去のアクセス情報に基づいた広告を表示します。
          </p>
          <p className="text-gray-600 leading-relaxed mt-2">
            ユーザーはGoogleの広告設定でパーソナライズ広告を無効にできます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. お問い合わせ</h2>
          <p className="text-gray-600 leading-relaxed">
            プライバシーに関するお問い合わせは、
            <a href="/contact" className="text-indigo-600 hover:underline">お問い合わせページ</a>
            からお願いします。
          </p>
        </section>
      </div>
    </main>
  );
}

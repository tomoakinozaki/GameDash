export const metadata = {
  title: "運営者情報",
  description: "GameDashの運営者情報。ゲーム価格比較サイトの特徴とデータソースについて。",
  openGraph: {
    title: "運営者情報 | GameDash",
    description: "GameDashの運営者情報。ゲーム価格比較サイトの特徴とデータソースについて。",
  },
};

export default function About() {
  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">運営者情報</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">サイトについて</h2>
          <p className="text-gray-600 leading-relaxed">
            GameDashは、PCゲームの価格情報を一か所で比較できるサービスです。
            Steam、Epic Games Store、GOG、itch.io、Indiegalaの5つのストアから
            無料ゲームや割引情報をリアルタイムで取得し、ユーザーが最適なゲームfindingをサポートします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">サービスの特徴</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>複数ストアの価格を一覧で比較</li>
            <li>無料ゲームの情報をリアルタイムで更新</li>
            <li>期間限定セールの情報を随時確認</li>
            <li>日本円（JPY）と米ドル（USD）の両方で表示</li>
            <li>ストア別のフィルタリング機能</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">運営者情報</h2>
          <div className="text-gray-600 space-y-2">
            <p><span className="font-medium">サイト名:</span> GameDash</p>
            <p><span className="font-medium">運営者:</span> 個人</p>
            <p><span className="font-medium">お問い合わせ:</span> <a href="/contact" className="text-indigo-600 hover:underline">お問い合わせページ</a></p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">データソース</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトでは、各ストアの公開APIおよびRSSフィードを使用してゲーム情報を取得しています。
            取得元のストア：Steam（CheapShark API）、Epic Games Store、GOG、itch.io、Indiegala
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">免責事項</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトに掲載されている価格情報は、取得時点のものです。実際の価格は各ストアの公式サイトをご確認ください。
            アフィリエイトリンクを含んでおり、リンク経由で購入すると紹介料を受け取る場合があります。
          </p>
        </section>
      </div>
    </main>
  );
}

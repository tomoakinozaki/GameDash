export default function Terms() {
  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">利用規約</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. サービスについて</h2>
          <p className="text-gray-600 leading-relaxed">
            GameDash（以下「当サイト」）は、ゲームの価格情報をまとめた情報サイトです。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 情報の正確性</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトに掲載されている情報は、公開時点での正確な情報であることを心がけていますが、完全性を保証するものではありません。最新情報は各ストアの公式サイトをご確認ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. アフィリエイトリンク</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトにはアフィリエイトリンクが含まれています。リンク経由で購入すると、当サイトが紹介料を受け取る場合があります。商品の価格やサービス内容に影響はありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. 禁止事項</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>当サイトのコンテンツの無断転載</li>
            <li>当サイトへの不正アクセス</li>
            <li>他のユーザーへの迷惑行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. 免責事項</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトの利用によって生じた損害について、当サイトは一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. 規約の変更</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトは、必要に応じて本規約を変更する権利を有します。
          </p>
        </section>
      </div>
    </main>
  );
}

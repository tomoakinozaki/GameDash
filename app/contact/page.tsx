export default function Contact() {
  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">お問い合わせ</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">運営者情報</h2>
          <div className="text-gray-600 space-y-2">
            <p><span className="font-medium">サイト名:</span> GameDash</p>
            <p><span className="font-medium">運営者:</span> 個人</p>
            <p><span className="font-medium">メール:</span> contact@gamedash.example.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">お問い合わせ内容</h2>
          <div className="text-gray-600 space-y-2">
            <p>以下の内容についてお問い合わせいただけます：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>サイトのバグ報告</li>
              <li>機能リクエスト</li>
              <li>広告掲載について</li>
              <li>パートナーシップについて</li>
              <li>その他</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">免責事項</h2>
          <p className="text-gray-600 leading-relaxed">
            当サイトに掲載されている情報は、公開時点でのものです。最新情報は各ストアの公式サイトをご確認ください。
          </p>
        </section>

        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-gray-700">
            お問い合わせはメールにてお願いいたします。<br />
            返信には数日かかる場合がございます。
          </p>
        </div>
      </div>
    </main>
  );
}

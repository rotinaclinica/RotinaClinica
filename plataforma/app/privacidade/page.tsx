export const metadata = { title: "Política de Privacidade" };

export default function PrivacidadePage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 prose prose-zinc">
      <h1>Política de Privacidade</h1>
      <p>
        Esta plataforma coleta apenas os dados necessários para prestação do serviço: nome,
        e-mail e dados de pagamento processados pelos gateways Stripe e Mercado Pago.
      </p>
      <h2>Dados coletados</h2>
      <ul>
        <li>Nome e e-mail para criação de conta</li>
        <li>Histórico de compras para controle de acesso</li>
        <li>Dados de pagamento processados de forma segura pelos gateways</li>
      </ul>
      <h2>Compartilhamento</h2>
      <p>
        Não vendemos ou compartilhamos seus dados com terceiros, exceto os gateways de
        pagamento para processamento da transação.
      </p>
      <h2>Contato</h2>
      <p>
        Para exercer seus direitos sob a LGPD ou para dúvidas sobre privacidade, entre em
        contato pelo e-mail de suporte.
      </p>
    </main>
  );
}

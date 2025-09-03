import React from 'react';

const SombrasDoAbismoPreview: React.FC = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#121212', 
      color: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'Roboto, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: 'rgba(24, 24, 24, 0.9)',
        borderRadius: '12px',
        border: '1px solid #2a2a2a'
      }}>
        <h1 style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '3.5rem',
          color: '#f0f0f0',
          letterSpacing: '3px',
          margin: '0 0 1rem 0',
          textShadow: '0 0 10px rgba(50, 205, 50, 0.2)'
        }}>
          Sombras do Abismo
        </h1>
        <p style={{ color: '#ccc', fontStyle: 'italic', fontSize: '1.2rem' }}>
          Sistema Completo de RPG - Bugs Corrigidos e Funcionalidades Expandidas
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginTop: '2rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ color: '#f0f0f0', fontWeight: 'bold', textDecoration: 'underline' }}>Home</div>
          <div style={{ color: '#32cd32', fontWeight: 'bold' }}>Agentes</div>
          <div style={{ color: '#ffc107', fontWeight: 'bold' }}>Campanhas</div>
          <div style={{ color: '#dc3545', fontWeight: 'bold' }}>Ameaças</div>
          <div style={{ color: '#9b59b6', fontWeight: 'bold' }}>Homebrew</div>
          <div style={{ color: '#6f42c1', fontWeight: 'bold' }}>Patente</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        <div style={{
          backgroundColor: 'rgba(24, 24, 24, 0.9)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #2a2a2a',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            color: '#32cd32', 
            marginBottom: '1rem',
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '2rem'
          }}>
            🔧 Bugs Corrigidos
          </h2>
          <ul style={{ 
            textAlign: 'left', 
            color: '#ccc',
            lineHeight: '1.8'
          }}>
            <li>✅ <strong style={{color: '#32cd32'}}>Navegação Livre:</strong> Usuário pode alternar entre etapas</li>
            <li>✅ <strong style={{color: '#32cd32'}}>Estado Preservado:</strong> Seleções mantidas ao voltar</li>
            <li>✅ <strong style={{color: '#32cd32'}}>Classe Visível:</strong> Seleção sempre aparece corretamente</li>
            <li>✅ <strong style={{color: '#32cd32'}}>Formulário Completo:</strong> Etapa 3 totalmente funcional</li>
            <li>✅ <strong style={{color: '#32cd32'}}>Validação Melhorada:</strong> Feedback visual em tempo real</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: 'rgba(24, 24, 24, 0.9)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #2a2a2a',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            color: '#32cd32', 
            marginBottom: '1rem',
            fontFamily: 'Bebas Neue, sans-serif',
            fontSize: '2rem'
          }}>
            📝 Formulário Expandido
          </h2>
          <div style={{ textAlign: 'left', color: '#ccc' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#f0f0f0' }}>8 Campos:</strong> Nome, idade, profissão, aparência, história, motivação, medos, habilidades
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#f0f0f0' }}>Seções Organizadas:</strong> Informações básicas, físicas e personalidade
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#f0f0f0' }}>Resumo Visual:</strong> Preview do personagem em tempo real
            </div>
            <div>
              <strong style={{ color: '#f0f0f0' }}>Design Moderno:</strong> Animações e efeitos visuais
            </div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'rgba(24, 24, 24, 0.9)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #2a2a2a',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          color: '#32cd32', 
          marginBottom: '1.5rem',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '2.5rem'
        }}>
          🎮 Experiência do Usuário Melhorada
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          textAlign: 'left'
        }}>
          <div>
            <h3 style={{ color: '#32cd32', marginBottom: '0.5rem' }}>Navegação Intuitiva</h3>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Clique em qualquer etapa para navegar livremente. Seus dados são preservados automaticamente.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#ffc107', marginBottom: '0.5rem' }}>Formulário Rico</h3>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Campos detalhados para criar personagens únicos com história, motivações e características.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>Feedback Visual</h3>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Validação em tempo real, efeitos hover e animações para uma experiência fluida.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#9b59b6', marginBottom: '0.5rem' }}>Responsividade</h3>
            <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
              Interface otimizada para desktop e mobile com layouts adaptativos.
            </p>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: 'rgba(50, 205, 50, 0.1)',
        border: '1px solid #32cd32',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          color: '#32cd32', 
          marginBottom: '1rem',
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: '1.8rem'
        }}>
          🚀 Sistema Totalmente Funcional
        </h3>
        <p style={{ color: '#ccc', lineHeight: '1.6' }}>
          O wizard de criação de personagens agora funciona perfeitamente!<br/>
          <strong>Navegue livremente entre as etapas</strong> - seus dados são preservados<br/>
          <strong>Complete o formulário detalhado</strong> - crie personagens únicos e memoráveis<br/>
          <strong>Veja o resumo em tempo real</strong> - acompanhe a criação do seu agente
        </p>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          border: '1px solid #ffc107',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#ffc107', margin: 0, fontWeight: 'bold' }}>
            💾 Sobre salvar no GitHub: Infelizmente não posso acessar repositórios externos, mas todos os arquivos estão prontos para serem copiados para seu projeto!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SombrasDoAbismoPreview;
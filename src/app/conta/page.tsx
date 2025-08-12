"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  User, 
  CreditCard, 
  Package, 
  Zap, 
  Bell,
  Upload,
  Building,
  MapPin,
  Calendar,
  Receipt,
  Smartphone
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const menuItems = [
  { id: "geral", label: "Geral", icon: Settings },
  { id: "perfil", label: "Perfil", icon: User },
  { id: "cobranca", label: "Cobrança", icon: CreditCard },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "crm", label: "CRM", icon: Building },
  { id: "modelos", label: "Modelos", icon: Package },
]

export default function ContaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState("geral")
  const [selectedNotification, setSelectedNotification] = useState("nothing")
  const [selectedPayment, setSelectedPayment] = useState("credit")
  const [emailSettings, setEmailSettings] = useState({
    communication: false,
    marketing: false,
    social: true,
    security: true
  })

  // Função para alternar toggle switches
  const toggleEmailSetting = (type: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Sincronizar com URL params
  useEffect(() => {
    const section = searchParams.get("section")
    if (section && menuItems.find(item => item.id === section)) {
      setActiveSection(section)
    }
  }, [searchParams])

  // Função para navegar entre seções
  const navigateToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    router.push(`/conta?section=${sectionId}`)
  }

  const getSectionTitle = () => {
    const section = menuItems.find(item => item.id === activeSection)
    return section ? section.label : "Geral"
  }

  const getSectionDescription = () => {
    switch(activeSection) {
      case "geral":
        return "Configurações e opções para sua aplicação."
      case "perfil":
        return "Atualize os detalhes do seu perfil."
      case "cobranca":
        return "Gerencie suas informações de cobrança e planos."
      case "notificacoes":
        return "Configure suas preferências de notificação."
      case "crm":
        return "Configurações de integração com CRM."
      case "modelos":
        return "Gerencie modelos de IA e configurações."
      default:
        return "Configurações e opções para sua aplicação."
    }
  }

  const renderSectionContent = () => {
    switch(activeSection) {
      case "geral":
        return renderGeralContent()
      case "perfil":
        return renderPerfilContent()
      case "cobranca":
        return renderCobrancaContent()
      case "notificacoes":
        return renderNotificacoesContent()
      case "crm":
        return renderCrmContent()
      case "modelos":
        return renderModelosContent()
      default:
        return renderGeralContent()
    }
  }

  const renderGeralContent = () => (
    <div className="max-w-[600px] space-y-6">
      {/* Logo da Empresa */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium">
          Logo da Empresa
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center hover:border-black transition-colors duration-200">
          <div className="text-gray-500 mb-4">
            Arraste e solte seu logo aqui, ou clique para navegar
          </div>
          <Button className="px-4 py-2 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200">
            <Upload className="w-4 h-4 mr-2" />
            Escolher arquivo
          </Button>
        </div>
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Faça upload do logo da sua empresa para personalizar sua aplicação.
        </p>
      </div>


      {/* CNPJ da Empresa */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium" htmlFor="cnpj">
          CNPJ da Empresa *
        </label>
        <div className="relative">
          <input
            type="text"
            id="cnpj"
            required
            readOnly
            value="12.345.678/0001-90"
            className="w-full px-4 py-3 pr-10 text-sm text-black bg-gray-50 border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out cursor-not-allowed"
            placeholder="Digite o CNPJ da sua empresa"
          />
          <Building className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          CNPJ da empresa registrado no sistema. Este campo não pode ser alterado.
        </p>
      </div>

      {/* Endereço da Empresa */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium" htmlFor="address">
          Endereço da Empresa
        </label>
        <div className="relative">
          <input
            type="text"
            id="address"
            className="w-full px-4 py-3 pr-10 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Digite seu endereço comercial completo"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Seu endereço comercial completo para documentação oficial.
        </p>
      </div>

      {/* Botão Salvar */}
      <div className="pt-4">
        <Button 
          size="lg"
          className="px-6 py-3 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200"
        >
          Salvar Alterações
        </Button>
      </div>
    </div>
  )

  const renderPerfilContent = () => (
    <div className="max-w-[600px] space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium" htmlFor="name">
          Nome
        </label>
        <input 
          type="text" 
          id="name" 
          className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Seu nome"
        />
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Este é o nome que será exibido no seu perfil e em e-mails.
        </p>
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium" htmlFor="email">
          E-mail
        </label>
        <Select>
          <SelectTrigger className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out focus:border-black focus:ring-1 focus:ring-black">
            <SelectValue placeholder="Selecione um e-mail verificado para exibir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="email1">user@example.com</SelectItem>
            <SelectItem value="email2">admin@example.com</SelectItem>
            <SelectItem value="email3">contact@example.com</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Você pode gerenciar endereços de e-mail verificados nas configurações de e-mail.
        </p>
      </div>

      {/* Data de nascimento */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium" htmlFor="birthdate">
          Data de nascimento
        </label>
        <input 
          type="text" 
          id="birthdate" 
          className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          defaultValue="22 jan 2023"
        />
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Sua data de nascimento é usada para calcular sua idade.
        </p>
      </div>


      {/* Save Button */}
      <div className="pt-4">
        <Button 
          size="lg"
          className="px-6 py-3 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200"
        >
          Atualizar perfil
        </Button>
      </div>
    </div>
  )

  const renderCobrancaContent = () => (
    <div className="max-w-[600px] space-y-6">
      <style jsx>{`
        .payment-option {
          flex: 1;
          padding: 20px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #ffffff;
        }
        .payment-option:hover {
          border-color: #9ca3af;
        }
        .payment-option.selected {
          border-color: #000000;
          background-color: #f9fafb;
        }
        .payment-icon {
          margin-bottom: 8px;
          color: #000000;
          display: flex;
          justify-content: center;
        }
        .payment-label {
          font-size: 14px;
          font-weight: 500;
          color: #000000;
        }
      `}</style>

      {/* Nome de usuário e Cidade em duas colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-black text-sm font-medium" htmlFor="username">
            Nome de usuário
          </label>
          <input 
            type="text" 
            id="username" 
            className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Digite seu nome de usuário"
          />
          <p className="text-gray-500 text-[13px] leading-[1.4]">
            Este é o seu nome de usuário.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-black text-sm font-medium" htmlFor="city">
            Cidade
          </label>
          <input 
            type="text" 
            id="city" 
            className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Digite sua cidade"
          />
          <p className="text-gray-500 text-[13px] leading-[1.4]">
            Este é o nome da sua cidade.
          </p>
        </div>
      </div>

      {/* Seção de Pagamento */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium">Pagamento</label>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div 
            className={`payment-option ${selectedPayment === "credit" ? "selected" : ""}`}
            onClick={() => setSelectedPayment("credit")}
          >
            <div className="payment-icon">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="payment-label">Cartão de Crédito</div>
          </div>
          
          <div 
            className={`payment-option ${selectedPayment === "boleto" ? "selected" : ""}`}
            onClick={() => setSelectedPayment("boleto")}
          >
            <div className="payment-icon">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="payment-label">Boleto</div>
          </div>
          
          <div 
            className={`payment-option ${selectedPayment === "pix" ? "selected" : ""}`}
            onClick={() => setSelectedPayment("pix")}
          >
            <div className="payment-icon">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="payment-label">PIX</div>
          </div>
        </div>
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Selecione sua forma de pagamento preferida.
        </p>
      </div>

      {/* Número do Cartão */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium" htmlFor="cardNumber">
          Número do Cartão
        </label>
        <input 
          type="text" 
          id="cardNumber" 
          className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Digite o número do cartão"
        />
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Este é o número do seu cartão.
        </p>
      </div>

      {/* Validade, Ano e CV em três colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-black text-sm font-medium" htmlFor="expires">
            Validade
          </label>
          <select 
            id="expires"
            className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="">Mês</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>
          <p className="text-gray-500 text-[13px] leading-[1.4]">
            Esta é a data de validade do seu cartão.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-black text-sm font-medium" htmlFor="year">
            Ano
          </label>
          <select 
            id="year"
            className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="">Ano</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
          <p className="text-gray-500 text-[13px] leading-[1.4]">
            Este é o ano de validade do seu cartão.
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="block text-black text-sm font-medium" htmlFor="cv">
            CV
          </label>
          <input 
            type="text" 
            id="cv" 
            className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            placeholder="CVC"
            maxLength={3}
          />
          <p className="text-gray-500 text-[13px] leading-[1.4]">
            Este é o seu código CV.
          </p>
        </div>
      </div>

      {/* Botão Continuar */}
      <div className="pt-4">
        <Button 
          size="lg"
          className="px-6 py-3 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200"
        >
          Continuar
        </Button>
      </div>
    </div>
  )

  const renderNotificacoesContent = () => (
    <div className="max-w-[600px] space-y-6">
      <style jsx>{`
        .radio-input {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          margin-right: 12px;
          position: relative;
          cursor: pointer;
          transition: border-color 0.2s ease;
          flex-shrink: 0;
        }
        .radio-input:hover {
          border-color: #9ca3af;
        }
        .radio-input.checked {
          border-color: #000000;
        }
        .radio-input.checked::after {
          content: '';
          position: absolute;
          top: 4px;
          left: 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #000000;
        }
        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background-color: #d1d5db;
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .toggle-switch.active {
          background-color: #000000;
        }
        .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: #ffffff;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }
        .toggle-switch.active .toggle-slider {
          transform: translateX(20px);
        }
        .checkbox-input {
          width: 20px;
          height: 20px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          margin-right: 12px;
          position: relative;
          cursor: pointer;
          transition: border-color 0.2s ease;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .checkbox-input:hover {
          border-color: #9ca3af;
        }
        .checkbox-input.checked {
          border-color: #000000;
          background-color: #000000;
        }
        .checkbox-input.checked::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 2px;
          color: #ffffff;
          font-size: 14px;
          font-weight: bold;
        }
      `}</style>

      {/* Seção de Radio Buttons */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium">Me notifique sobre...</label>
        
        <div className="space-y-3">
          <div className="flex items-center cursor-pointer" onClick={() => setSelectedNotification("all")}>
            <div className={`radio-input ${selectedNotification === "all" ? "checked" : ""}`} data-value="all"></div>
            <span className="text-sm text-black cursor-pointer">Todas as novas mensagens</span>
          </div>
          
          <div className="flex items-center cursor-pointer" onClick={() => setSelectedNotification("direct")}>
            <div className={`radio-input ${selectedNotification === "direct" ? "checked" : ""}`} data-value="direct"></div>
            <span className="text-sm text-black cursor-pointer">Mensagens diretas e menções</span>
          </div>
          
          <div className="flex items-center cursor-pointer" onClick={() => setSelectedNotification("nothing")}>
            <div className={`radio-input ${selectedNotification === "nothing" ? "checked" : ""}`} data-value="nothing"></div>
            <span className="text-sm text-black cursor-pointer">Nada</span>
          </div>
        </div>
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Escolha quando você deseja receber notificações.
        </p>
      </div>

      {/* Seção de Email Notifications */}
      <div className="space-y-2">
        <label className="block text-black text-sm font-medium">Notificações por Email</label>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border border-gray-300 rounded-md bg-white">
            <div className="flex-1">
              <div className="text-black text-sm font-medium mb-1">E-mails de comunicação</div>
              <div className="text-gray-500 text-[13px]">Receba e-mails sobre a atividade da sua conta.</div>
            </div>
            <div 
              className={`toggle-switch ${emailSettings.communication ? "active" : ""}`} 
              onClick={() => toggleEmailSetting("communication")}
              data-type="communication"
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 border border-gray-300 rounded-md bg-white">
            <div className="flex-1">
              <div className="text-black text-sm font-medium mb-1">E-mails de marketing</div>
              <div className="text-gray-500 text-[13px]">Receba e-mails sobre novos produtos, recursos e muito mais.</div>
            </div>
            <div 
              className={`toggle-switch ${emailSettings.marketing ? "active" : ""}`} 
              onClick={() => toggleEmailSetting("marketing")}
              data-type="marketing"
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 border border-gray-300 rounded-md bg-white">
            <div className="flex-1">
              <div className="text-black text-sm font-medium mb-1">E-mails sociais</div>
              <div className="text-gray-500 text-[13px]">Receba e-mails para solicitações de amizade, seguidores e muito mais.</div>
            </div>
            <div 
              className={`toggle-switch ${emailSettings.social ? "active" : ""}`} 
              onClick={() => toggleEmailSetting("social")}
              data-type="social"
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 border border-gray-300 rounded-md bg-white">
            <div className="flex-1">
              <div className="text-black text-sm font-medium mb-1">E-mails de segurança</div>
              <div className="text-gray-500 text-[13px]">Receba e-mails sobre a atividade e segurança da sua conta.</div>
            </div>
            <div 
              className={`toggle-switch ${emailSettings.security ? "active" : ""}`} 
              onClick={() => toggleEmailSetting("security")}
              data-type="security"
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-[13px] leading-[1.4]">
          Configure quais tipos de e-mail você deseja receber.
        </p>
      </div>


      {/* Botão de Update */}
      <div className="pt-4">
        <Button 
          size="lg"
          className="px-6 py-3 text-sm font-medium text-white bg-black border border-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors duration-200"
        >
          Atualizar notificações
        </Button>
      </div>
    </div>
  )

  const renderCrmContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integração CRM</CardTitle>
          <CardDescription>
            Configure integrações com sistemas de CRM.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configurações de CRM em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderModelosContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Modelos de IA</CardTitle>
          <CardDescription>
            Gerencie e configure modelos de inteligência artificial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configurações de modelos em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <AdminLayout 
      breadcrumb={[
        { title: "Admin", href: "/admin" },
        { title: "Configuração" },
        { title: getSectionTitle() }
      ]}
    >
      <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de Navegação */}
          <div className="w-full lg:w-64">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left text-sm transition-colors rounded-md ${
                      isActive 
                        ? "bg-accent text-accent-foreground font-medium" 
                        : "text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Área Principal de Conteúdo */}
          <div className="flex-1 space-y-6">
            {/* Cabeçalho da Seção */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{getSectionTitle()}</h1>
              <p className="text-muted-foreground">
                {getSectionDescription()}
              </p>
              <Separator className="w-full mt-4" />
            </div>

            {renderSectionContent()}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 
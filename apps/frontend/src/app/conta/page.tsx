"use client"

import { AdminLayout } from "@/components/layouts/AdminLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  BadgeCheck,
  CreditCard, 
  Package, 
  Zap, 
  Bell,
  Upload,
  Building,
  MapPin,
  Calendar,
  Receipt,
  Smartphone,
  Eye,
  EyeOff
} from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const menuItems = [
  { id: "geral", label: "Geral", icon: Settings },
  { id: "perfil", label: "Perfil", icon: BadgeCheck },
  { id: "cobranca", label: "Cobrança", icon: CreditCard },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "crm", label: "CRM", icon: Building },
  { id: "modelos", label: "Modelos", icon: Package },
]

export default function ContaPage() {
  return (
    <Suspense fallback={null}>
      <ContaPageContent />
    </Suspense>
  )
}

function ContaPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState("geral")
  const [selectedNotification, setSelectedNotification] = useState("nothing")
  const [selectedPayment, setSelectedPayment] = useState("credit")
  const [activeTab, setActiveTab] = useState("api-keys")
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    gemini: "",
    grok: ""
  })
  const [apiToggleStates, setApiToggleStates] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    grok: false
  })
  const [selectedModels, setSelectedModels] = useState({
    openai: "",
    anthropic: "",
    gemini: "",
    grok: ""
  })
  const [keyVisibility, setKeyVisibility] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    grok: false
  })
  const [emailSettings, setEmailSettings] = useState({
    communication: false,
    marketing: false,
    flow: true,
    security: true
  })

  // Função para alternar toggle switches
  const toggleEmailSetting = (type: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Funções para gerenciar API keys e modelos
  const toggleApiKeyVisibility = (provider: keyof typeof keyVisibility) => {
    setKeyVisibility(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const toggleApiState = (provider: keyof typeof apiToggleStates) => {
    setApiToggleStates(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const saveApiKey = (provider: keyof typeof apiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }))
  }

  const selectModel = (provider: keyof typeof selectedModels, value: string) => {
    setSelectedModels(prev => ({
      ...prev,
      [provider]: value
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

      {/* Campos específicos baseados na forma de pagamento */}
      {selectedPayment === "credit" && (
        <>
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
        </>
      )}

      {selectedPayment === "boleto" && (
        <>
          {/* Nome completo do pagador */}
          <div className="space-y-2">
            <label className="block text-black text-sm font-medium" htmlFor="payerName">
              Nome completo do pagador
            </label>
            <input 
              type="text" 
              id="payerName" 
              className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
              placeholder="Digite o nome completo do pagador"
            />
            <p className="text-gray-500 text-[13px] leading-[1.4]">
              Nome completo da pessoa ou empresa responsável pelo pagamento.
            </p>
          </div>

          {/* CPF ou CNPJ do pagador */}
          <div className="space-y-2">
            <label className="block text-black text-sm font-medium" htmlFor="payerDocument">
              CPF ou CNPJ do pagador
            </label>
            <input 
              type="text" 
              id="payerDocument" 
              className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
            <p className="text-gray-500 text-[13px] leading-[1.4]">
              CPF para pessoa física ou CNPJ para pessoa jurídica.
            </p>
          </div>

          {/* E-mail do pagador */}
          <div className="space-y-2">
            <label className="block text-black text-sm font-medium" htmlFor="payerEmail">
              E-mail do pagador
            </label>
            <input 
              type="email" 
              id="payerEmail" 
              className="w-full h-12 px-4 text-sm text-black bg-white border border-gray-300 rounded-md outline-none transition-colors duration-200 ease-in-out placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
              placeholder="Digite o e-mail do pagador"
            />
            <p className="text-gray-500 text-[13px] leading-[1.4]">
              E-mail para envio do boleto e confirmações de pagamento.
            </p>
          </div>
        </>
      )}

      {selectedPayment === "pix" && (
        <div className="space-y-2">
          <div className="p-6 border border-gray-300 rounded-md bg-gray-50 text-center">
            <p className="text-black text-sm font-medium mb-2">Pagamento via PIX</p>
            <p className="text-gray-600 text-sm">
              Após confirmar, você receberá um código PIX para realizar o pagamento instantaneamente.
            </p>
          </div>
        </div>
      )}

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
              <div className="text-black text-sm font-medium mb-1">E-mails de fluxo</div>
              <div className="text-gray-500 text-[13px]">Receba e-mails com notificações sobre o seu fluxo.</div>
            </div>
            <div 
              className={`toggle-switch ${emailSettings.flow ? "active" : ""}`} 
              onClick={() => toggleEmailSetting("flow")}
              data-type="flow"
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
    <div className="max-w-[800px] space-y-6">
      <style jsx>{`
        .api-tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 32px;
        }
        .api-tab {
          padding: 12px 0;
          margin-right: 32px;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        .api-tab.active {
          color: #000000;
          border-bottom-color: #0ea5e9;
        }
        .api-tab:hover {
          color: #000000;
        }
        .model-section {
          padding: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 16px;
          background-color: #ffffff;
        }
        .model-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .model-title {
          color: #000000;
          font-size: 16px;
          font-weight: 600;
        }
        .model-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .api-toggle-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .toggle-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .api-toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background-color: #d1d5db;
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        .api-toggle-switch.active {
          background-color: #10b981;
        }
        .api-toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: #ffffff;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .api-toggle-switch.active .api-toggle-slider {
          transform: translateX(20px);
        }
        .model-description {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.4;
        }
        .api-key-section {
          margin-top: 16px;
        }
        .api-key-label {
          color: #000000;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          display: block;
        }
        .api-key-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .api-key-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          font-size: 14px;
          color: #000000;
          background-color: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.2s ease;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          letter-spacing: 0.5px;
        }
        .api-key-input:focus {
          border-color: #000000;
          box-shadow: 0 0 0 1px #000000;
        }
        .api-key-input::placeholder {
          color: #9ca3af;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .api-key-input:disabled {
          background-color: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
        }
        .api-key-input:disabled::placeholder {
          color: #d1d5db;
        }
        .toggle-visibility {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .toggle-visibility:hover {
          color: #000000;
        }
        .toggle-visibility:disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
        .version-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .version-label {
          color: #000000;
          font-size: 14px;
          font-weight: 500;
        }
        .version-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .version-date {
          color: #6b7280;
          font-size: 14px;
        }
        .version-badge {
          background-color: #f3f4f6;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>

      {/* Tabs */}
      <div className="api-tabs">
        <div 
          className={`api-tab ${activeTab === "api-keys" ? "active" : ""}`}
          onClick={() => setActiveTab("api-keys")}
        >
          API Keys
        </div>
        <div 
          className={`api-tab ${activeTab === "custo" ? "active" : ""}`}
          onClick={() => setActiveTab("custo")}
        >
          Custo
        </div>
      </div>

      {/* AI Models Section */}
    <div className="space-y-6">
        <h2 className="text-black text-lg font-semibold mb-4">Modelos de IA Disponíveis</h2>
        
        {/* OpenAI Models */}
        <div className="model-section">
          <div className="model-header">
            <h3 className="model-title">OpenAI</h3>
            <div className="model-controls">
              <div className="model-selector">
                <Select 
                  value={selectedModels.openai} 
                  onValueChange={(value) => selectModel('openai', value)}
                  disabled={!apiToggleStates.openai}
                >
                  <SelectTrigger className="w-[200px] h-10 text-sm">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</SelectItem>
                    <SelectItem value="text-davinci-003">Text Davinci 003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="api-toggle-container">
                <span className="toggle-label">API</span>
                <div 
                  className={`api-toggle-switch ${apiToggleStates.openai ? "active" : ""}`}
                  onClick={() => toggleApiState('openai')}
                >
                  <div className="api-toggle-slider"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="model-description">
            Modelos de linguagem avançados da OpenAI para conversação e geração de texto.
          </div>
          <div className="api-key-section">
            <label className="api-key-label">Chave de API OpenAI</label>
            <div className="api-key-input-container">
              <input 
                type={keyVisibility.openai ? "text" : "password"}
                className="api-key-input"
                placeholder="sk-..."
                value={apiKeys.openai}
                onChange={(e) => saveApiKey('openai', e.target.value)}
                disabled={!apiToggleStates.openai}
              />
              <button 
                className="toggle-visibility"
                onClick={() => toggleApiKeyVisibility('openai')}
                disabled={!apiToggleStates.openai}
                title="Mostrar/Ocultar"
              >
                {keyVisibility.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Anthropic Models */}
        <div className="model-section">
          <div className="model-header">
            <h3 className="model-title">Anthropic</h3>
            <div className="model-controls">
              <div className="model-selector">
                <Select 
                  value={selectedModels.anthropic} 
                  onValueChange={(value) => selectModel('anthropic', value)}
                  disabled={!apiToggleStates.anthropic}
                >
                  <SelectTrigger className="w-[200px] h-10 text-sm">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                    <SelectItem value="claude-2.1">Claude 2.1</SelectItem>
                    <SelectItem value="claude-instant">Claude Instant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="api-toggle-container">
                <span className="toggle-label">API</span>
                <div 
                  className={`api-toggle-switch ${apiToggleStates.anthropic ? "active" : ""}`}
                  onClick={() => toggleApiState('anthropic')}
                >
                  <div className="api-toggle-slider"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="model-description">
            Assistentes de IA seguros e úteis da Anthropic com foco em conversação natural.
          </div>
          <div className="api-key-section">
            <label className="api-key-label">Chave de API Anthropic</label>
            <div className="api-key-input-container">
              <input 
                type={keyVisibility.anthropic ? "text" : "password"}
                className="api-key-input"
                placeholder="sk-ant-..."
                value={apiKeys.anthropic}
                onChange={(e) => saveApiKey('anthropic', e.target.value)}
                disabled={!apiToggleStates.anthropic}
              />
              <button 
                className="toggle-visibility"
                onClick={() => toggleApiKeyVisibility('anthropic')}
                disabled={!apiToggleStates.anthropic}
                title="Mostrar/Ocultar"
              >
                {keyVisibility.anthropic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Google Gemini Models */}
        <div className="model-section">
          <div className="model-header">
            <h3 className="model-title">Google Gemini</h3>
            <div className="model-controls">
              <div className="model-selector">
                <Select 
                  value={selectedModels.gemini} 
                  onValueChange={(value) => selectModel('gemini', value)}
                  disabled={!apiToggleStates.gemini}
                >
                  <SelectTrigger className="w-[200px] h-10 text-sm">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    <SelectItem value="gemini-pro-vision">Gemini Pro Vision</SelectItem>
                    <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                    <SelectItem value="palm-2">PaLM 2</SelectItem>
                    <SelectItem value="text-bison">Text Bison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="api-toggle-container">
                <span className="toggle-label">API</span>
                <div 
                  className={`api-toggle-switch ${apiToggleStates.gemini ? "active" : ""}`}
                  onClick={() => toggleApiState('gemini')}
                >
                  <div className="api-toggle-slider"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="model-description">
            Modelos multimodais do Google com capacidades avançadas de texto e visão.
          </div>
          <div className="api-key-section">
            <label className="api-key-label">Chave de API Google Gemini</label>
            <div className="api-key-input-container">
              <input 
                type={keyVisibility.gemini ? "text" : "password"}
                className="api-key-input"
                placeholder="AIza..."
                value={apiKeys.gemini}
                onChange={(e) => saveApiKey('gemini', e.target.value)}
                disabled={!apiToggleStates.gemini}
              />
              <button 
                className="toggle-visibility"
                onClick={() => toggleApiKeyVisibility('gemini')}
                disabled={!apiToggleStates.gemini}
                title="Mostrar/Ocultar"
              >
                {keyVisibility.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* xAI Grok Models */}
        <div className="model-section">
          <div className="model-header">
            <h3 className="model-title">xAI Grok</h3>
            <div className="model-controls">
              <div className="model-selector">
                <Select 
                  value={selectedModels.grok} 
                  onValueChange={(value) => selectModel('grok', value)}
                  disabled={!apiToggleStates.grok}
                >
                  <SelectTrigger className="w-[200px] h-10 text-sm">
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grok-1">Grok-1</SelectItem>
                    <SelectItem value="grok-1.5">Grok-1.5</SelectItem>
                    <SelectItem value="grok-2">Grok-2</SelectItem>
                    <SelectItem value="grok-beta">Grok Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="api-toggle-container">
                <span className="toggle-label">API</span>
                <div 
                  className={`api-toggle-switch ${apiToggleStates.grok ? "active" : ""}`}
                  onClick={() => toggleApiState('grok')}
                >
                  <div className="api-toggle-slider"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="model-description">
            Modelos de IA da xAI com acesso a informações em tempo real e personalidade única.
          </div>
          <div className="api-key-section">
            <label className="api-key-label">Chave de API xAI Grok</label>
            <div className="api-key-input-container">
              <input 
                type={keyVisibility.grok ? "text" : "password"}
                className="api-key-input"
                placeholder="xai-..."
                value={apiKeys.grok}
                onChange={(e) => saveApiKey('grok', e.target.value)}
                disabled={!apiToggleStates.grok}
              />
              <button 
                className="toggle-visibility"
                onClick={() => toggleApiKeyVisibility('grok')}
                disabled={!apiToggleStates.grok}
                title="Mostrar/Ocultar"
              >
                {keyVisibility.grok ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="version-item">
          <span className="version-label">Versão Global da API</span>
          <div className="version-info">
            <span className="version-date">13-Ago-2025</span>
            <span className="version-badge">Última Versão</span>
          </div>
        </div>
      </div>
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">{getSectionTitle()}</h1>
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
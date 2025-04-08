
# Guia de Implantação para Lojas de Aplicativos Móveis

Este documento fornece instruções passo a passo para configurar, construir e implantar o aplicativo HelpAqui nas lojas Google Play (Android) e App Store (iOS).

## Pré-requisitos

### Para Android:
- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [Android Studio](https://developer.android.com/studio)
- JDK 11 ou superior
- Conta de desenvolvedor do Google Play (US$ 25 para registro único)

### Para iOS:
- Mac com macOS recente
- [Xcode](https://developer.apple.com/xcode/) (versão mais recente recomendada)
- Conta de desenvolvedor Apple (US$ 99 por ano)

## Passos para implantação

### 1. Prepare o projeto

O projeto já está configurado com Capacitor, mas é necessário executar estes passos em seu ambiente local:

```bash
# Clone o repositório do GitHub
git clone [URL_DO_SEU_REPOSITÓRIO]
cd [NOME_DO_REPOSITÓRIO]

# Instale as dependências
npm install

# Construa a aplicação web
npm run build
```

### 2. Configuração de ícones e splashscreen

Antes de gerar os projetos nativos, é recomendado configurar os ícones do aplicativo e a tela de splash.

Para facilitar a geração de ícones, você pode usar o pacote `@capacitor/assets`:

```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

Ou substituir manualmente os arquivos de ícone em:
- `android/app/src/main/res/` (para Android)
- `ios/App/App/Assets.xcassets/` (para iOS)

### 3. Configuração do Android

```bash
# Adicione a plataforma Android
npx cap add android

# Sincronize os arquivos da build com o projeto nativo
npx cap sync android

# Abra o projeto no Android Studio
npx cap open android
```

No Android Studio:
1. Vá para `File > Project Structure > Modules > app`
2. Atualize as configurações de versão para lançamento:
   - `versionCode`: incrementar a cada envio (inicie com 1)
   - `versionName`: número da versão semântica (ex: "1.0.0")

3. Em `android/app/build.gradle`, configure a chave de assinatura para produção:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('caminho/para/keystore.jks')
            storePassword 'senha-do-keystore'
            keyAlias 'alias-da-chave'
            keyPassword 'senha-da-chave'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

4. Crie a keystore (faça backup desta chave, pois ela é necessária para todas as atualizações futuras):

```bash
keytool -genkey -v -keystore helpaqui.keystore -alias helpaqui -keyalg RSA -keysize 2048 -validity 10000
```

5. Gere o APK de lançamento:
   - No Android Studio, selecione: `Build > Generate Signed Bundle / APK`
   - Selecione APK e siga as instruções
   - Escolha `release` como variante de build

### 4. Configuração do iOS

```bash
# Adicione a plataforma iOS
npx cap add ios

# Sincronize os arquivos da build com o projeto nativo
npx cap sync ios

# Abra o projeto no Xcode
npx cap open ios
```

No Xcode:
1. Selecione o projeto na barra lateral
2. Na guia "General", configure:
   - Display Name: "HelpAqui"
   - Bundle Identifier: "app.helpaqui.mobile" (deve ser único)
   - Version: "1.0" (número da versão semântica)
   - Build: 1 (incrementar a cada envio)

3. Na guia "Signing & Capabilities":
   - Conecte-se com sua conta de desenvolvedor Apple
   - Selecione seu time de desenvolvimento
   - Ative "Automatically manage signing"

4. Configure informações de privacidade no `Info.plist` para recursos como geolocalização, câmera, etc.

### 5. Preparação para submissão

#### Para Google Play:
1. Acesse o [Google Play Console](https://play.google.com/console)
2. Crie um novo aplicativo
3. Preencha todos os detalhes necessários:
   - Descrições
   - Capturas de tela
   - Ícone de alta resolução
   - Classificação de conteúdo
   - Política de privacidade
4. Envie o APK ou Bundle para revisão

#### Para App Store:
1. No Xcode, selecione `Product > Archive`
2. Após a conclusão, clique em "Distribute App"
3. Selecione "App Store Connect" e siga as instruções
4. Acesse [App Store Connect](https://appstoreconnect.apple.com/)
5. Prepare a submissão com:
   - Capturas de tela
   - Descrições
   - Palavras-chave
   - URL de suporte
   - Política de privacidade
6. Envie para revisão

### 6. Considerações importantes

- **API Keys**: Certifique-se de que todas as chaves de API (como a do Mapbox) estejam configuradas corretamente para produção.

- **Autenticação**: Teste o fluxo de autenticação em ambientes nativos.

- **Notificações Push**: Configure o Firebase Cloud Messaging (FCM) para Android e o Apple Push Notification Service (APNs) para iOS.

- **Pagamentos**: Teste a integração do Stripe em ambos os ambientes.

- **Conformidade LGPD**: Certifique-se de que sua política de privacidade está adequada e implementada corretamente.

### 7. Atualização do aplicativo

Para atualizações futuras:

1. Atualize o código
2. Execute `npm run build`
3. Execute `npx cap sync`
4. Abra os projetos nativos (`npx cap open android` ou `npx cap open ios`)
5. Incremente as versões
6. Gere novos builds
7. Envie para as lojas

## Testando antes de enviar

### Android:
- Teste o APK em múltiplos dispositivos
- Use o Firebase Test Lab para testes automatizados

### iOS:
- Teste no TestFlight antes de enviar para revisão

## Suporte técnico

Se encontrar problemas durante o processo de implantação, consulte:

- [Documentação do Capacitor](https://capacitorjs.com/docs)
- [Guia de publicação para Google Play](https://developer.android.com/studio/publish)
- [Guia de publicação para App Store](https://developer.apple.com/app-store/submissions/)

# ⚡ AÇÃO IMEDIATA: Configurar Permissões

**Problema:** Ana cai em "Acesso Negado"  
**Solução:** Configurar perfis e vínculos manualmente via interface  
**Tempo:** 5 minutos

---

## 🎯 PASSO A PASSO

### **1. Acessar Debug (2 min)**
```
Login: ana@teste.com
Menu → Administração → 🔍 Debug Permissões
```

**Ver:**
- ✅ Tem Access Control? Tem Profile?
- ❌ Falta algo? Continue para passo 2

---

### **2. Criar Perfis (2 min)**
```
Menu → Administração → Perfil de Acesso → Novo Perfil
```

**Criar 3 perfis:**

1. **Super Admin** - Marcar TUDO ✅
2. **Visualizador** - Marcar só VIEW 👁️
3. **Gestor** - Marcar view/create/edit ⚙️

---

### **3. Vincular Usuários (1 min)**
```
Menu → Administração → Controle de Acesso → Novo Vínculo
```

**Criar 4 vínculos:**

1. ana@teste.com → Super Admin
2. maria@teste.com → Visualizador  
3. joao@teste.com → Gestor
4. pedro@teste.com → Super Admin

---

### **4. Testar**
```
Logout → Login Ana → /identification
✅ Deve carregar sem "Acesso Negado"
```

---

## 📊 Status

| Item | Status |
|------|--------|
| **Página de Debug** | ✅ Criada |
| **Link no Menu** | ✅ Adicionado |
| **Guia Completo** | ✅ Criado |
| **Telas de Admin** | ✅ Disponíveis |

---

## 🚀 Próximo Passo

**AGORA:**
```
1. Login: ana@teste.com
2. Ir para: Menu → Administração → 🔍 Debug Permissões
3. Verificar o que aparece
4. Se faltar algo: Seguir passos 2 e 3
```

---

## 📚 Documentação

- `MANUAL_CONFIG_GUIDE.md` - Guia completo passo a passo
- `TEMP_DISABLE_ACL.md` - Troubleshooting e alternativas
- `/debug-permissions` - Nova página de debug

---

## ✅ Resultado

Após configurar:

✅ Ana acessa tudo  
✅ Maria só visualiza  
✅ João cria/edita  
✅ Pedro administra  
✅ Pode criar novas variações  
✅ Pode testar cenários diferentes  

**Tempo:** 5 minutos  
**Status:** ✅ Pronto para configurar!

🎊 **Acesse /debug-permissions e comece!**

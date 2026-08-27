import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";

export const maxDuration = 120;

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");
const FROM = "Rotina Clínica <contato@rotinaclinica.com>";

const RAW_EMAILS = `guilhermesantosnunes@hotmail.com
barbaralasantos0@gmail.com
lais.tristao.loreto@gmail.com
daniellealmeidapaes@gmail.com
mirza.almeida@gmail.com
cletomsn@gmail.com
cinthiafmachado@gmail.com
wylk.macena@hotmail.com
dr.henriqueaso@gmail.com
bianca.brandao.med@gmail.com
fpazz454@gmail.com
dr.marlon.ramos@gmail.com
anasoophia20@gmail.com
analuisacaselli@gmail.com
laisa.souza03@souunit.com.br
daiprliege@gmail.com
adm@incubadorafirefly.com.br
amandacaroline2704@hotmail.com
matheusccosta.27@gmail.com
anacarolina_graciano@hotmail.com
letizancan@gmail.com
malu.r.lins@hotmail.com
rebecabd@live.com
eduardamoroz@hotmail.com
isabelicarvalhof@gmail.com
estervcolodette@gmail.com
luzilene.1011@gmail.com
ingridhnunes1@gmail.com
thereza.viana12@gmail.com
tamicchaves@hotmail.com
lianzanatta@gmail.com
nayramicaeli@hotmail.com
vix-vini@hotmail.com
gabrielledme@gmail.com
jpedro1190@hotmail.com
debora-jadjischi@hotmail.com
luizafigueiredo.ra@gmail.com
laurasmarinho4@gmail.com
marcelarabdallah@hotmail.com
lipesamcruz@gmail.com
annahelotavares@gmail.com
rebecapimentel_1@hotmail.com
waltercioguimaraes0162@gmail.com
driveprescricoes@gmail.com
isadora1.dellalibera@gmail.com
maiarambs25@gmail.com
lorenatoscano@gmail.com
leticia.barbosa.machado@gmail.com
janainaddourado27@gmail.com
brunadominguete@hotmail.com
adriana_km2011@hotmail.com
joyceoliveiracosta04@gmail.com
larissa.ketllen@unemat.br
lucasjacomassi2@gmail.com
leledrossi@gmail.com
tasla_@hotmail.com
raianeenascimento@hotmail.com
bealins@hotmail.com
nogaroguilherme@gmail.com
pamelafabro@hotmail.com
luanacapelli08@gmail.com
mariacaroline455@gmail.com
fabianarampazziloiola@gmail.com
oaarba.1a@gmail.com
aliciaqmarques@hotmail.com
lani_kusaba@hotmail.com
dra.liviamariafs@gmail.com
brunavitaal@icloud.com
vitoriapellacani@gmail.com
gontijoitalo1996@gmail.com
anaargolobacelar@gmail.com
matheus1673@live.com
mabaloinstitucional@gmail.com
mariacela025@gmail.com
matheusmendes0897@gmail.com
brunaarestides@hotmail.com
dudapaludo5@gmail.com
marcelotorres919@gmail.com
gabicaliixto@gmail.com
analuisa.osorio27@gmail.com
guimaraes_juliana@hotmail.com
laratasca@gmail.com
draalinefernandapedra@gmail.com
viaraujoo2018@hotmail.com
marydib3014@gmail.com
drlucassouza.b@gmail.com
joaopedrobertolo@gmail.com
duferencz@yahoo.com.br
virginiacastro1401@gmail.com
biancalouisefp@hotmail.com
isabelbeatriz.dc@hotmail.com
elizandra.bertolini@gmail.com
isabellaarakaki@hotmail.com
joaovictor_limacosta@hotmail.com
teixeirarochagabryella@gmail.com
vivi.birkett.ventura@gmail.com
gabriel.betez@icloud.com
rstinglin@hotmail.com
edinaldodiniz@gmail.com
viviliz270@hotmail.com
rscorrea13@outlook.com
ginunessb@gmail.com
gabipileggi123@gmail.com
amandaalcesa@gmail.com
cibelleleite.med@gmail.com
virginia.alves@upe.br
drandressafonseca@gmail.com
jumendesba@gmail.com
gabriela.cardoso.02@edu.unipar.br
vithoriabernierii@gmail.com
alicesantostoledo19@gmail.com
nicollesscopel@hotmail.com
anabe.bernardi@gmail.com
analuizadepaula2002@gmail.com
gigi.ponce@hotmail.com
lilianbezerra.med@gmail.com
leticia.raful023@gmail.com
analu1109@yahoo.com.br
ju.santana.1998@hotmail.com
henriquebervian2016@gmail.com
debora.carneiro2408@gmail.com
vvanessanunesalves@gmail.com
manuela.piancastelli@hotmail.com
mceringis@gmail.com
hallycyakarollyne@hotmail.com
slealribeiro@gmail.com
mariafmendesm@gmail.com
victoriacaroline03pacheco@gmail.com
matheus.favarin7@gmail.com
letimvieira@gmail.com
leticiavillelaservicosmedicos@gmail.com
medu.rodriguezz@gmail.com
lucastolentino26@gmail.com
fabiofleuri16@gmail.com
joaohff17@gmail.com
mellamaslima1@gmail.com
alicemaraia@hotmail.com
julianalima010601@gmail.com
lsvb.lauras@gmail.com
gabinascleite@gmail.com
luiza_vieira02@hotmail.com
camilafortesdossi@gmail.com
thiagoerwin@hotmail.com
arthurmedararas@hotmail.com
le.ludwig00@gmail.com
lorehalvees@gmail.com
iaraoliveiracosta98@gmail.com
pattyteberga@hotmail.com
taina0602@gmail.com
marianacbcavalcanti@hotmail.com
iza.contarato@gmail.com
sophi737@gmail.com
lorennalessa@hotmail.com
geisinhakellir@gmail.com
med-biancazaia@camporeal.edu.br
deia_kk13@hotmail.com
anandacastro363@gmail.com
t.bernardes@uni9.edu.br
giovanacremonesic@hotmail.com
bbarbaratxr@gmail.com
carollsilvasou@gmail.com
juliaselestinocosta@gmail.com
andribuzzo@hotmail.com
raissafrazao@gmail.com
maria.gabrielly.m@icloud.com
dralarissacruz@outlook.com
millenabarcellos2@gmail.com
rafaelaproenca@hotmail.com
lelesiebra@gmail.com
leticiaisrael@hotmail.com
giuliaperlinn@gmail.com
myrellealmeida2023@outlook.com
yanna.buzahr@hotmail.com
andrezabrigith@hotmail.com
rachelhguidolim@gmail.com
martins.daniele@hotmail.com
antoniocarlosdiasandrade@gmail.com
raylana@gmail.com
rebecagomezmojon@gmail.com
mariliacflorencio@gmail.com
adrielle.m.c.dias@gmail.com
marcia.bbringel@gmail.com
lilianfjardim@hotmail.com
carolinaf.oliveira@hotmail.com
hagar_silva@hotmail.com
brenndafgusmao@gmail.com
vaniakarleneenfer@gmail.com
ana_carol11@outlook.com.br
caroline.unime@gmail.com
giovanna.duarte888@gmail.com
aline.silveira118@al.unieduk.com.br
leticialarasantana@gmail.com
dominique_lebourlegat@hotmail.com
lara_munayer10@hotmail.com
julianachu@outlook.com
beatrizguarini@hotmail.com
thaynanspereira@gmail.com
biancalena60@gmail.com
lidia.sa@discente.ufma.br
fonsecaalvaro7@gmail.com
melloamanda0@gmail.com
gleicy200@hotmail.com
karoueme@gmail.com
thaysaestetica@gmail.com
lais_nadille@hotmail.com
matheus210420@gmail.com
paulianeamorim@hotmail.com
naarahsarah13@gmail.com
belabelap.lopes@gmail.com
aureliorodelas@gmail.com
geovannag01@gmail.com
dantasbmariana@gmail.com
roseanedaniela075@hotmail.com
franci1982@hotmail.com
rafael.linhares@ufv.br
lidiane_bispo@hotmail.com
leandraneivajordao@hotmail.com
amandanunes.bsc@gmail.com
jualsousa83@gmail.com
juscopelb@gmail.com
cinthyamleitedesouza@outlook.com
clarinhavdb@gmail.com
fsclaudiano@yahoo.com.br
freiremarquescarina@gmail.com
luanadealmeidasantoss@yahoo.com
claudioalves_04@hotmail.com
juliana-lsantos@hotmail.com
tam.fariasn@gmail.com
anaraquelss78@gmail.com
ramosthayane99@gmail.com
mcanevaridemaio@gmail.com
paolagprusso@gmail.com
joyce.danymor@gmail.com
nandagespindola0708@gmail.com
rafaella.rllf@gmail.com
anabeatriz017@icloud.com
giovianan@gmail.com
beatrizf606@gmail.com
abraaokessler@gmail.com
thaynamacieldo@gmail.com
raizaudi17@hotmail.com
laurafrodrigues@hotmail.com
ymcc32@yahoo.com.br
larahferrugini@gmail.com
mldaher27@gmail.com
lailabss@hotmail.com
lara.ljfo@gmail.com
annedaniela18@gmail.com
vitorh.giudice@gmail.com
mairakari@gmail.com
rossattob@gmail.com
gabrielaa.fs84@gmail.com
gissele0904@hotmail.com
cl062846@gmail.com
kellycrisb@hotmail.com
ana.lino@arapiraca.ufal.br
stephannevnr10@hotmail.com
machadore17@gmail.com
vanessa.moreira38@yahoo.com.br
alana-braga@live.com
laise.aoliveira@gmail.com
annaluiza110@hotmail.com
mylenekettermanngabe@gmail.com
mariana000757@outlook.com
reilanag@outlook.com
koglermed@gmail.com
sam.maarques@gmail.com
susannacarvalho7.sc@gmail.com
laravgsantos@gmail.com
elen_2805@hotmail.com
prisciilaborgesmed@gmail.com
anna.leitgeb@hotmail.com
isabella@netwt.com.br
danielesueiro@hotmail.com
renata.veiga9@gmail.com
georgecamaral@hotmail.com
paollamed15@gmail.com
marcelasbarbosa.med@gmail.com
brunatsfernandes@gmail.com
delmondesflaviani@gmail.com
juliane.bispo@ufba.br
lizlopes1@hotmail.com
vilarjully@gmail.com
claragvidal@hotmail.com
gaabimalavolta@gmail.com
pamellacristinasilvaa@gmail.com
victorialemosdavid@hotmail.com
carolcolnaghi@hotmail.com
isabellabuonopane@ufba.br
sabrina_martins2008@hotmail.com
isabella.idsr@gmail.com
gabriela.sbsa@ocloud.com
juliia.pereeira@hotmail.com
camilamaues@gmail.com
mayarahsereno98@gmail.com
terlleysousa@gmail.com
thaiane.s.ferreira@gmail.com
andressinhacde10@gmail.com
lydiarmoreira@hotmail.com
mmaguiarfavaro@gmail.com
saulo_gyn@hotmail.com
nainabz79@gmail.com
alicefla2010@hotmail.com
camilaftolentino@hotmail.com
br.lago92@gmail.com
bruniinho92@hotmail.com
mariana_10sp@hotmail.com
dancbrasil_@hotmail.com
cacaiaaguiar22@gmail.com
biancagferreira2@gmail.com
isadhora.r14@gmail.com
fernandasalesso@gmail.com
ednapatekoski@hotmail.com
giovannajt@outlook.com
julianadinizbarbieri@gmail.com
jonathanmed2023@gmail.com
dracbm94@gmail.com
annapaula_ribeiros@hotmail.com
alanny.m@hotmail.com.br
thaysfreitasramos@hotmail.com
alanarodrigues-@hotmail.com
keityresende@gmail.com
larissameirelles@hotmail.com.br
carolinearaujo689@gmail.com
nayannacartaxo@gmail.com
simonedemolliner@gmail.com
laura.paiva06@hotmail.com
marinavsanches99@gmail.com
abeatriznp@hotmail.com
marageorgiasl@gmail.com
elenboulhosa@gmail.com
nninoassis@gmail.com
daiana.ferreira14@hotmail.com
ayallagandra@gmail.com
danielbuso.geo@gmail.com
barbarallsilva21@gmail.com
andressa_christiny1@hotmail.com
keilaneaazevedofacid@gmail.com
claumed2303@gmail.com
juliafflara@hotmail.com
tataifbraga@hotmail.com
gabrielanetowanderley@gmail.com
marinal.souza97@gmail.com
anavdm.ic@hotmail.com
biaparedes@yahoo.com.br
alinedbezerra@gmail.com
annabaratierip@gmail.com
jordana-vaz@hotmail.com
sofiacisneiros.med@gmail.com
vignamaria1995@gmail.com
clara_cotta@hotmail.com
biancabsh.cachu@gmail.com
cinthiaeduarda533@gmail.com
felipefermo@yahoo.com.br
felicio.martinelli@gmail.com
ceciliabaratela@gmail.com
brunellalyra@gmail.com
gohapao@gmail.com
taynaraalmas@gmail.com
igorbmelo@hotmail.com
fernandacaetanoss@hotmail.com
thiago.borges2017@hotmail.com
junior.fernandesdesouza@hotmail.com
msbraga1804@gmail.com
andreemendes@hotmail.com
gabriella_os@hotmail.com
alanaacorso16@gmail.com
lizsomerlate@gmail.com
camilacoelho0210@gmail.com
carinaalmeida721@gmail.com
malurosamello@gmail.com
amykarolee@hotmail.com
amandadiaspereira12@hotmail.com
brunnascimento@gmail.com
rafaeladsantospinheiro@gmail.com
amandadinizbcoutinho@gmail.com
iagobertoco@gmail.com
sabrina.costa.mendess@gmail.com
deoliveira.jessyca@gmail.com
pamelamalta.08@gmail.com
bisewskicarol@gmail.com
laiseunice.medicina@outlook.com
anacarolinadc@gmail.com
fornazarimed@outlook.com
jady12.caldas@gmail.com
larissamuricy.s@gmail.com
yana.bnogueira@gmail.com
ngeraldoa@gmail.com
gabrielamariafeitosa@gmail.com
novaesdanyelle@hotmail.com
lorennabaldoino@hotmail.com
ceceloliveira@hotmail.com
raissa.tiradentes@hotmail.com
gabrieldaher67@gmail.com
camilalimaf0@gmail.com
geovannang@gmail.com
eduardabenevenute@gmail.com
gabrielacarvalhodf@gmail.com
gabriellaraujo@hotmail.com
jamillyb.tavares@hotmail.com
cathnp@gmail.com
natalia_ferreira09@hotmail.com
jerusaataides@gmail.com
milenedelimapaz@gmail.com
rafaamaranhao52@gmail.com
drasanndyalves@gmail.com
mariaanjosgois@gmail.com
alanacarla2016@gmail.com
goudardbia452@gmail.com
rosanaramosmed@gmail.com
ingridayk@msn.com
scscosta19@gmail.com
jordanawy@gmail.com
sthefanidasilva32@gmail.com
milenavieiraa16@gmail.com
borgesmariaeduarda1@gmail.com
udsonpatricio3@gmail.com
mfcecon@gmail.com
analaurajoanini@icloud.com
annalaura0602@hotmail.com
rafaela_delsanto@hotmail.com
ju.geller@hotmail.com
leticiadalla@gmail.com
paulabferolla@gmail.com
aylaotrop@gmail.com
laissafiorotti1@gmail.com
ericsantorio@hotmail.com
izadoranb@hotmail.com
isabellapianca@gmail.com
isa_ctb@hotmail.com
aceciliaalves@gmail.com
raulbicalho@hotmail.com
hglaris@gmail.com
lairabassini@hotmail.com
iandondoni@hotmail.com
mariza.duartesantos@gmail.com
marianalorencini@hotmail.com
bianor.terra@gmail.com
allanamoulin@gmail.com
amanda.lima.mutz@gmail.com
gabriela.savoli@gmail.com
marianamacabu@gmail.com
victorgalvao21@gmail.com
louzadacarloseduardo@gmail.com
matosingrid1971@gmail.com
drpedronewton@gmail.com
sintiasan@hotmail.com
kamillalacchine@gmail.com
lelapretti2004@hotmail.com
diegoferreira.c4@gmail.com
mariajulia-gomesferreira@outlook.com
rafaela.ribeiro.90.rr@gmail.com
patrickhfc@hotmail.com
eduardaportela@hotmail.com
aliineemarina@hotmail.com
danssilvasantos@gmail.com
isadoramartins840@yahoo.com.br
victorferrari700@gmail.com
mendesamanda1895@gmail.com
santos.vieira@hotmail.com
thaisyandressaprimo@gmail.com
fhvuolo@gmail.com
laira.braum@gmail.com
fuath1724@gmail.com
leticiarangelf@gmail.com
jmps.maria@gmail.com
raissagmagal@gmail.com
danielfachinjunior@gmail.com
marqueslimaamanda@gmail.com
carolggarcia1998@gmail.com
vitoriaazevedomidia@gmail.com
carolinaulianab@gmail.com
juniorfiscalcremesc@gmail.com
cassia-novaes@hotmail.com
brunnavfaria@gmail.com
jeusmatos@gmail.com
danubionino9@gmail.com
liaasrocha@gmail.com
japiassuc11@gmail.com
pedrojuca@alu.ufc.br
gabrielaborges202@gmail.com
tdm2809@gmail.com
wesfabio6@gmail.com
larissa_cardoso97@yahoo.com.br
jcarlosrib78@gmail.com
laisse2006@gmail.com
an4coelh0@gmail.com
batistasalana@gmail.com
liviaprates1812@gmail.com
marcelasoaresg2015@hotmail.com
amanda_cardoso98@hotmail.com
samantharosas1999@gmail.com
luana403@gmail.com
antonio.cfc01@hotmail.com
judicefernanda@gmail.com
wilson.coelho@discente.ufma.br
vithoriavid@gmail.com
alfredoborges46@gmail.com
anajesusalvess@hotmail.com
nshuenck@hotmail.com
gustavolima730813@gmail.com
larafhonorio@gmail.com
flavioa.alves@terra.com.br
ariana.lopes@ufba.br
marinagd.diniz@gmail.com
larissaraminellimartins@gmail.com
yasminreali@gmail.com
mylenacvieira@gmail.com
paulabobbio1@gmail.com
rn_fagundes00@hotmail.com
lvitorialago96@gmail.com
guiib9@gmail.com
lu_mahiara27@hotmail.com
carolperroud@alumni.usp.br
srcoelho28@gmail.com
millena.perin@gmail.com
marinaluzml@hotmail.com
rampanelli.gabi@hotmail.com
dr.flavioantonioalves@gmail.com
carolinebordincorrea@gmail.com
samiracostac@gmail.com
imartinsmadeira@gmail.com
louisemrpo@yahoo.com
viviannegrigolo@hotmail.com
dr.iurilauricio@gmail.com
simonesoaresesouza@gmail.com
drathainarosas@hotmail.com
wanessabs11@gmail.com
nicmenezes2002@gmail.com
carolinameduvv@gmail.com
anabstefenoni@gmail.com
jorlan.medufes@outlook.com
milenamalisek@gmail.com
gabrielledme@gmail.com
flavinho_mario@hotmail.com
tiagobarcelos73@gmail.com
willdonatelli4587@gmail.com
azizecapuchojorge@gmail.com
jennifferjacob92@gmail.com
pedro.affonsoga@gmail.com
izabohier@gmail.com
juliana.dgeller@gmail.com
claradepcosta@gmail.com
Lucas.chieppe@outlook.com
annadockhorn.med@gmail.com
karolinesb28@gmail.com
alinelaureth0705@gmail.com
davicr1999@gmail.com
clayton_hd@hotmail.com
francisco.serra@edu.ufes.br
ester.hubnero@gmail.com
weslenlp@hotmail.com
carolsadovsky@hotmail.com
lucagg3@hotmail.com
carolinacoutinho.med@gmail.com
patrickhc11@gmail.com
rebecaveronez.rv@gmail.com
evellync.serafim@gmail.com
sarah.kretli@gmail.com
sarah-rebecaa@hotmail.com
lu_klaws@hotmail.com
vialthaina@gmail.com
marcosbah@hotmail.com
daniely_07@hotmail.com
malcategabriel@gmail.com
viccoutinhoc@gmail.com
alineoliveira0692@gmail.com
j_jorges@hotmail.com
wilton_melomorais@hotmail.com
taylacol@gmail.com
paulasalezzi@gmail.com
lessa-gg@hotmail.com
luiza.zuccon@outlook.com
luisadualves@gmail.com
julianapeterle@hotmail.com
anrod9400@gmail.com
matheusabettio@gmail.com
anabiacastron@gmail.com
rafaclbp@gmail.com
camilacarlini29@gmail.com
giovannacolodetti13@gmail.com
pedrohugoramos@gmail.com`;

export function getEmailList(): string[] {
  const seen = new Set<string>();
  return RAW_EMAILS.split("\n")
    .map((line) => line.trim().split(/\s+/)[0].toLowerCase())
    .filter((email) => {
      if (!email || !email.includes("@") || !email.includes(".")) return false;
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });
}

function buildHtml(subject: string, body: string): string {
  const paragraphs = body
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 18px;color:#4a6a80;font-size:15px;line-height:1.8">${p}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dde6ef">

        <!-- Header -->
        <tr>
          <td style="background:#0f2d4a;padding:36px 40px">
            <p style="margin:0 0 4px;color:#3db8d4;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase">Rotina Clínica</p>
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.4">${subject}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px">
            ${paragraphs}
            <p style="margin:32px 0 0;color:#94a8b8;font-size:13px;text-align:center;line-height:1.6">
              Dúvidas? Fale com a gente: <a href="mailto:contato@rotinaclinica.com" style="color:#3db8d4;text-decoration:none">contato@rotinaclinica.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f4f8;padding:20px 40px;text-align:center">
            <p style="margin:0;color:#94a8b8;font-size:12px">
              © ${new Date().getFullYear()} Rotina Clínica ·
              <a href="https://www.rotinaclinica.com" style="color:#94a8b8;text-decoration:none">rotinaclinica.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function GET() {
  const session = await (await import("@/lib/auth")).auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ total: getEmailList().length });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body } = await req.json() as { subject: string; body: string };
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "subject e body são obrigatórios" }, { status: 400 });
  }

  const emails = getEmailList();
  const html = buildHtml(subject, body);
  const BATCH_SIZE = 50;

  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE).map((to) => ({
      from: FROM,
      to,
      subject,
      html,
    }));

    try {
      await resend.batch.send(batch);
      sent += batch.length;
    } catch (err) {
      failed += batch.length;
      errors.push(String(err));
    }

    // Pausa entre batches para respeitar rate limits
    if (i + BATCH_SIZE < emails.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return NextResponse.json({ total: emails.length, sent, failed, errors });
}

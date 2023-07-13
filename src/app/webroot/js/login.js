const
d = DIV('-row', { height:'80vh', top:'4em' }).app(
    TAG('form', '-centered', { width:'24em' }).attr({ action:'javascript:void(0)' }).app(
        DIV('-row', { padding:'1em' }).app(
            TAG('input', '-row', {
                padding:'1em 2em'
                , border:'none'
                , background:fw.pallete.FONT+'22'
                , color: fw.pallete.FOREGROUND
                , borderRadius: '.5em'
            }).attr({ name:'user', type:'user', placeholder:'Usuário' })
        )
    ).app(
        DIV('-row', { padding:'1em' }).app(
            TAG('input', '-row -hash', {
                padding:'1em 2em'
                , border:'none'
                , background:fw.pallete.FONT+'22'
                , color: fw.pallete.FOREGROUND
                , borderRadius: '.5em'
            }).attr({ name:'pswd', type:'password', placeholder:'Senha' })
        )
    ).app(
        DIV('-row', { padding:".5em" }).app(
            DIV('-row', { background: fw.pallete.FONT+'22', height:'1px' })
        )
    ).app(
        DIV('-row', { padding:'1em' }).app(
            TAG('input', '-row --submit', {
                padding:'1em 2em'
                , border:'none'
                , background: fw.pallete.GREEN_SEA
                , color: fw.pallete.FOREGROUND
                , borderRadius: '.5em'
            }).attr({ type:'submit', value:'Pronto!' })
        )
    ).app(
        DIV('-row -content-center', { padding:".5em" }).app(
            DIV('-row -centered', { background: fw.pallete.FONT+'22', height:'1px' })
        ).app(
            SPAN('OU', null, { color: fw.pallete.SILVER+'44', padding:'1em 2em' })
        )
    ).app(
        DIV('-row', { padding:'1em' }).app(
            TAG('input', '-row', { padding:'1em 2em', border:'none', background:fw.pallete.FONT+'22', borderRadius: '.5em' }).attr({ name:'token', type:'text', placeholder:'Chave' })
        )
    )
)
;;

$('#app')[0].empty().css({ background: fw.pallete.MIDNIGHT_BLUE }).app(
    TAG('header', '-row -fixed -zero -content-center', { height:'20vh' }).app(
        SPAN('LOGO', '-centered', { color: fw.pallete.FONT+"", fontSize:'3em' })
    )
).app(d)

$('#app .--submit')[0].on('click', function() {
    const data = this.upFind('form').json() ;;
    sock('users/sign', { data, callback: res => {
        if(res?.status) {
            fw.storage('uat', res.uat)
            fw.success('Login realizado com sucesso! Reiniciando o sistema...')
            setTimeout(_ => location.reload(), 2000)
        } else fw.error('Ops! Algo deu errado, tente novamente mais tarde...')
    } })
})
import * as React from 'react'
import * as m from 'react-materialize'
import { shell } from 'electron'
import { timeout, TimeoutError } from 'promise-timeout'
import GithubService, { GithubTag } from '../../GithubService'
import Gopass from "../../../secrets/Gopass"

export default class Home extends React.Component<any, { tags: GithubTag[] }> {
    constructor(props: any) {
        super(props)
        this.state = {
            tags: []
        }
    }

    public async componentDidMount() {
        const tags = await GithubService.getTagsOfRepository('codecentric', 'gopass-ui')
        this.setState({ tags })
    }

    public render() {
        const { tags } = this.state
        const lastTag = tags[tags.length - 1]
        const lastTagName = lastTag ? lastTag.ref.slice(10, lastTag.ref.length) : ''

        return (
            <>
                <h3>Welcome to Gopass UI</h3>
                <h4>Setup</h4>
                <m.CardPanel>
                    You have to meet the following requirements to use our application:
                    <ul>
                        <li>* sure, you need gopass up and running 🙂</li>
                        <li>* MAC: you should use the <span className="code">pinentry-mac</span> tool to enter your passphrase</li>
                    </ul>
                    <m.Button onClick={this.testEnvironment} waves='light'>Test your environment</m.Button>
                </m.CardPanel>

                <m.CardPanel>
                    Choose a secret from the navigation or use the actions at the top.
                    { lastTag && (
                        <>
                            {' '}
                            Make sure you got the latest version of Gopass UI so you don't miss any update:{' '}
                            <a onClick={this.openLatestReleasePage}>{`${lastTagName} on Github`}</a>
                        </>
                    ) }
                </m.CardPanel>

                <h4 className='m-top'>Global search window</h4>
                <m.CardPanel>
                    The shortcut for the global search window for quick secret clipboard-copying is:
                    <pre>(cmd || ctrl) + shift + p</pre>
                </m.CardPanel>

                <h4 className='m-top'>Issues</h4>
                <m.CardPanel>
                    Please report any issues and problems to us on <a className='link' onClick={ this.openIssuesPage }>Github</a>.
                    We are very keen about your feedback and appreciate any help.
                </m.CardPanel>
            </>
        )
    }

    private testEnvironment = async () => {
        const firstEntry = await this.getFirstEntry()

        if (firstEntry) {
            const result = await this.decryptEntry(firstEntry)

            console.log('TEST RESULT', result)
        }
    }

    private async decryptEntry(entry: string) {
        const timeoutInSeconds = 3
        try {
            await timeout(Gopass.show(entry), timeoutInSeconds * 1000)

            return true
        }
        catch (err) {
            if (err instanceof TimeoutError) {
                console.error(`ERROR: Could not decrypt entry ${entry} within ${timeoutInSeconds} seconds.`)
            } else {
                console.error(`Something else went wrong: ${err.message}`)
            }
        }

        return false
    }

    private async getFirstEntry() {
        try {
            return await timeout(Gopass.getFirstEntry(), 1500)
        }
        catch (err) {
            if (err instanceof TimeoutError) {
                console.error('ERROR: no connection to gopass at all. Did you install it?')
            }
        }
    }

    private openLatestReleasePage = () => {
        shell.openExternal('https://github.com/codecentric/gopass-ui/releases/latest')
    }

    private openIssuesPage = () => {
        shell.openExternal('https://github.com/codecentric/gopass-ui/issues')
    }
}

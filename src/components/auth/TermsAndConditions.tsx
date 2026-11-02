/**
 * TermsAndConditions — read-only dialog with static legal text.
 * Ported from Angular login.component.html T&C modal.
 *
 * NOTE: Informational only. No acceptance state, no login gating.
 * The login form has a "By logging in, you agree to all the Terms and Conditions" link
 * that opens this dialog.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsAndConditions({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Terms And Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              By using TheAlgohopper (thealgohopper.com) and its services (website, algos, tools, product etc.)
              you agree to the following terms of use.
            </p>
            <p>
              The website located at{" "}
              <a href="https://thealgohopper.com" target="_blank" rel="noopener" className="text-primary underline">
                https://thealgohopper.com
              </a>{" "}
              (the "Site") is a copyrighted work and certain features of the Site may be subject to
              additional guidelines, terms, or rules, which will be posted on the Site in connection
              with such features, including without limitation the Company's Privacy Policy, the
              Platform Services Agreement, the Subscription and Sublicense Agreement, all of which
              are incorporated by reference to these Terms. All such additional terms, guidelines, and
              rules are incorporated by reference into these Terms.
            </p>
            <p>
              THESE TERMS OF USE (THESE "TERMS") SET FORTH THE LEGALLY BINDING TERMS AND CONDITIONS
              THAT GOVERN YOUR USE OF THE SITE. BY ACCESSING OR USING THE SITE, YOU ARE ACCEPTING
              THESE TERMS (ON BEHALF OF YOURSELF OR THE ENTITY THAT YOU REPRESENT), AND YOU REPRESENT
              AND WARRANT THAT YOU HAVE THE RIGHT, AUTHORITY, AND CAPACITY TO ENTER INTO THESE TERMS.
              YOU MAY NOT ACCESS OR USE THE SITE OR ACCEPT THE TERMS IF YOU ARE NOT AT LEAST 18 YEARS
              OLD. IF YOU DO NOT AGREE WITH ALL OF THE PROVISIONS OF THESE TERMS, DO NOT ACCESS AND/OR
              USE THE SITE.
            </p>
            <p>
              THIS AGREEMENT REQUIRES THE USE OF ARBITRATION ON AN INDIVIDUAL BASIS TO RESOLVE
              DISPUTES, RATHER THAN JURY TRIALS OR CLASS ACTIONS, AND ALSO LIMITS THE REMEDIES
              AVAILABLE TO YOU IN THE EVENT OF A DISPUTE. PLEASE CAREFULLY READ THESE TERMS OF USE
              BEFORE ACCESSING THE SITE OR USING ANY OF THE SERVICES. IF YOU DO NOT WISH TO BE BOUND BY
              THESE TERMS AND CONDITIONS OR IF YOU CANNOT REMAIN IN COMPLIANCE WITH SUCH TERMS AND
              CONDITIONS, YOU MAY NOT ACCESS THE SITE OR USE ANY OF THE SERVICES AND SHOULD
              IMMEDIATELY CEASE SUCH ACCESS AND USE.
            </p>
            <p>
              In order to use certain features of the Site, you must register for an account ("Account")
              and provide certain information about yourself as prompted by the account registration
              process. You represent and warrant that: (a) all required registration information you
              submit is truthful and accurate; (b) you will maintain the accuracy of such information.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your Account login information
              and are fully responsible for all activities that occur under your Account.
            </p>
            <p>
              YOU ARE ENTIRELY RESPONSIBLE FOR ANY AND ALL ACTIVITIES AND CONDUCT, WHETHER BY YOU OR
              ANYONE ELSE, THAT ARE CONDUCTED THROUGH YOUR ACCOUNT.
            </p>
            <p>
              You agree to immediately notify Company of any unauthorized use, or suspected unauthorized
              use of your Account or any other breach of security. Company cannot and will not be liable
              for any loss or damage arising from your failure to comply with the above requirements.
            </p>
            <p className="font-medium text-foreground">No Investment Advice</p>
            <p>
              TheAlgohopper is a technology platform that provides tools and information for educational
              and informational purposes only. Nothing on the Site constitutes investment advice or a
              recommendation to buy, sell, or hold any security or financial instrument.
            </p>
            <p className="font-medium text-foreground">Live Trading Risks</p>
            <p>
              Trading in financial markets involves substantial risk of loss. You should only trade with
              capital you can afford to lose. Past performance does not guarantee future results. You are
              solely responsible for any trading decisions you make.
            </p>
            <p className="font-medium text-foreground">Risk Disclosure</p>
            <p>
              THE SITE AND ALL SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. THE COMPANY
              DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

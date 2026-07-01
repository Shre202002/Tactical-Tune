import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — TacticalTune",
  description: "Get in touch with TacticalTune for support, sales, and general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-background min-h-screen pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border py-12 md:py-16">
        <div className="container-tactical text-center">
          <h1 className="text-display text-4xl md:text-5xl mb-4">Comms Channel</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Need tactical support or have a question about your gear? Reach out to our operators and we'll get back to you ASAP.
          </p>
        </div>
      </div>

      <div className="container-tactical mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <h2 className="text-display text-2xl border-b border-border pb-4">Direct Lines</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center text-primary shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Headquarters</h3>
                <p className="text-muted-foreground mt-1">
                  TacticalTune Armory<br />
                  100 Precision Way, Block A<br />
                  New Delhi, 110001, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center text-primary shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Phone Support</h3>
                <p className="text-muted-foreground mt-1">
                  +91 (800) TAC-GEAR<br />
                  Mon-Fri: 09:00 - 18:00 IST
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary rounded-sm flex items-center justify-center text-primary shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">Email</h3>
                <p className="text-muted-foreground mt-1">
                  support@tacticaltune.com<br />
                  sales@tacticaltune.com
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-sm border border-border">
            <h2 className="text-display text-2xl mb-6">Send a Message</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</label>
                  <input type="text" id="firstName" className="w-full bg-background border border-border rounded-sm p-3 focus:outline-none focus:border-primary transition-colors text-foreground" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</label>
                  <input type="text" id="lastName" className="w-full bg-background border border-border rounded-sm p-3 focus:outline-none focus:border-primary transition-colors text-foreground" placeholder="Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                <input type="email" id="email" className="w-full bg-background border border-border rounded-sm p-3 focus:outline-none focus:border-primary transition-colors text-foreground" placeholder="john@example.com" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                <textarea id="message" rows={5} className="w-full bg-background border border-border rounded-sm p-3 focus:outline-none focus:border-primary transition-colors text-foreground resize-none" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold uppercase tracking-wider py-3 rounded-sm hover:bg-primary/90 transition-colors btn-tactical-glow">
                Transmit Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

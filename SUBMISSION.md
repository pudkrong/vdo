## Models

**Offer**

Offer class will manage the offer such as checking overlap offer, merge. and revoke. It will calculate number of days for the offer based on the given date and the period. 2 offers can fall in one of the below
cases

* p1 is before p2
* p1 is after p2
* p1 is overlapped with p2 with p1's start date is earlier
* p1 is overlapped with p2 with p2's start date is earlier
* p1 range is totally cover p2 range
* p2 range is totally cover p1 range

**User**

User class will handle all offers given to the particular user. One user can have multiple offers if
the offer range is not overlapped the others. It also deals with the revocation and releases the user
if revoking the expired offer.

**Partner**

Partner class represents each partner and its all users. It will verify users with the given accounts. 


**Subscriptions**

Subscription class will check all offers from all partners based on the given business rules. It also flags
the invalid offers. So, if needed, we can get all invalid offers.

## Concerns

Since there is no rule mentions the fact that 2 partners give an offer with the same date to the same user. In this case, the app will randomly pick the user from one partner and invalid another.

